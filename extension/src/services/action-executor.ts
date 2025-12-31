/**
 * Action Executor
 * Executes browser actions and automations
 */

import type { MemoryNode } from "@shared/extension-types";

export interface Action {
  type: "open_tab" | "close_tab" | "navigate" | "fill_form" | "click" | "extract";
  data: Record<string, unknown>;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: unknown;
}

export class ActionExecutor {
  /**
   * Execute an action
   */
  async execute(action: Action): Promise<ActionResult> {
    try {
      switch (action.type) {
        case "open_tab":
          return await this.openTab(action.data);
        case "close_tab":
          return await this.closeTab(action.data);
        case "navigate":
          return await this.navigate(action.data);
        case "fill_form":
          return await this.fillForm(action.data);
        case "click":
          return await this.click(action.data);
        case "extract":
          return await this.extract(action.data);
        default:
          return {
            success: false,
            message: `Unknown action type: ${(action as any).type}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Open a new tab
   */
  private async openTab(data: Record<string, unknown>): Promise<ActionResult> {
    const url = data.url as string;
    if (!url) {
      return { success: false, message: "URL is required" };
    }

    try {
      const tab = await chrome.tabs.create({ url });
      return {
        success: true,
        message: "Tab opened successfully",
        data: { tabId: tab.id },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to open tab",
      };
    }
  }

  /**
   * Close a tab
   */
  private async closeTab(data: Record<string, unknown>): Promise<ActionResult> {
    const tabId = data.tabId as number;
    if (typeof tabId !== "number") {
      return { success: false, message: "Tab ID is required" };
    }

    try {
      await chrome.tabs.remove(tabId);
      return {
        success: true,
        message: "Tab closed successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to close tab",
      };
    }
  }

  /**
   * Navigate to a URL
   */
  private async navigate(data: Record<string, unknown>): Promise<ActionResult> {
    const url = data.url as string;
    const tabId = data.tabId as number | undefined;

    if (!url) {
      return { success: false, message: "URL is required" };
    }

    try {
      if (tabId) {
        await chrome.tabs.update(tabId, { url });
      } else {
        const tab = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab[0]) {
          await chrome.tabs.update(tab[0].id!, { url });
        } else {
          return { success: false, message: "No active tab found" };
        }
      }
      return {
        success: true,
        message: "Navigation successful",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to navigate",
      };
    }
  }

  /**
   * Fill a form (requires content script injection)
   */
  private async fillForm(data: Record<string, unknown>): Promise<ActionResult> {
    const tabId = data.tabId as number | undefined;
    const fields = data.fields as Record<string, string> | undefined;

    if (!fields || Object.keys(fields).length === 0) {
      return { success: false, message: "Form fields are required" };
    }

    try {
      const targetTabId = tabId || (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.id;
      if (!targetTabId) {
        return { success: false, message: "No tab found" };
      }

      // Inject script to fill form
      await chrome.scripting.executeScript({
        target: { tabId: targetTabId },
        func: (fields: Record<string, string>) => {
          Object.entries(fields).forEach(([selector, value]) => {
            const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
            if (element) {
              element.value = value;
              element.dispatchEvent(new Event("input", { bubbles: true }));
              element.dispatchEvent(new Event("change", { bubbles: true }));
            }
          });
        },
        args: [fields],
      });

      return {
        success: true,
        message: "Form filled successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fill form",
      };
    }
  }

  /**
   * Click an element
   */
  private async click(data: Record<string, unknown>): Promise<ActionResult> {
    const tabId = data.tabId as number | undefined;
    const selector = data.selector as string;

    if (!selector) {
      return { success: false, message: "Selector is required" };
    }

    try {
      const targetTabId = tabId || (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.id;
      if (!targetTabId) {
        return { success: false, message: "No tab found" };
      }

      await chrome.scripting.executeScript({
        target: { tabId: targetTabId },
        func: (sel: string) => {
          const element = document.querySelector(sel) as HTMLElement;
          if (element) {
            element.click();
          }
        },
        args: [selector],
      });

      return {
        success: true,
        message: "Click executed successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to click element",
      };
    }
  }

  /**
   * Extract data from page
   */
  private async extract(data: Record<string, unknown>): Promise<ActionResult> {
    const tabId = data.tabId as number | undefined;
    const selector = data.selector as string;

    if (!selector) {
      return { success: false, message: "Selector is required" };
    }

    try {
      const targetTabId = tabId || (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.id;
      if (!targetTabId) {
        return { success: false, message: "No tab found" };
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: targetTabId },
        func: (sel: string) => {
          const elements = Array.from(document.querySelectorAll(sel));
          return elements.map((el) => ({
            text: el.textContent,
            html: el.innerHTML,
            attributes: Array.from(el.attributes).reduce((acc, attr) => {
              acc[attr.name] = attr.value;
              return acc;
            }, {} as Record<string, string>),
          }));
        },
        args: [selector],
      });

      return {
        success: true,
        message: "Data extracted successfully",
        data: results[0]?.result,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to extract data",
      };
    }
  }

  /**
   * Open related pages for a memory node
   */
  async openRelatedPages(node: MemoryNode, limit: number = 3): Promise<ActionResult> {
    // This would use the recall service to find related pages
    // For now, return a placeholder
    return {
      success: true,
      message: `Would open ${limit} related pages for ${node.title}`,
    };
  }
}

export const actionExecutor = new ActionExecutor();


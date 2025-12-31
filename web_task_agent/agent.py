from __future__ import annotations

import argparse
import asyncio
import re
from dataclasses import dataclass
from typing import Optional

from playwright.async_api import async_playwright, Page


@dataclass(frozen=True)
class TaskRequest:
    task: str
    location: Optional[str] = None
    datetime: Optional[str] = None
    preferences: Optional[str] = None


@dataclass(frozen=True)
class RoutedSite:
    name: str
    url: str
    query: str


def _normalize(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip().lower()


def route_task(req: TaskRequest) -> RoutedSite:
    t = _normalize(req.task)
    loc = _normalize(req.location or "")
    prefs = _normalize(req.preferences or "")

    is_movie = any(k in t for k in ["movie", "tickets", "showtime", "show time", "cinema"]) or "bookmyshow" in t
    is_travel = any(k in t for k in ["flight", "flights", "train", "bus", "hotel", "hotels", "trip"]) or "google flights" in t
    is_food = any(k in t for k in ["restaurant", "restaurants", "cafe", "cafes", "food", "dinner", "lunch", "breakfast"]) or "maps" in t
    is_shopping = any(k in t for k in ["buy", "price", "shop", "shopping", "order", "amazon", "flipkart"]) 

    if is_movie:
        q = req.task
        if req.location:
            q = f"{q} {req.location}"
        if req.datetime:
            q = f"{q} {req.datetime}"
        return RoutedSite(name="BookMyShow", url="https://in.bookmyshow.com/", query=q)

    if is_travel:
        q = req.task
        if req.datetime:
            q = f"{q} {req.datetime}"
        return RoutedSite(name="Google Flights", url="https://www.google.com/travel/flights", query=q)

    if is_food:
        q = req.task
        if req.location:
            q = f"{q} {req.location}"
        return RoutedSite(name="Google Maps", url="https://www.google.com/maps", query=q)

    if is_shopping or "amazon" in prefs:
        q = req.task
        return RoutedSite(name="Amazon", url="https://www.amazon.com/", query=q)

    q = req.task
    if req.location:
        q = f"{q} {req.location}"
    return RoutedSite(name="Google Search", url="https://www.google.com/", query=q)


async def _dismiss_common_popups(page: Page) -> None:
    selectors = [
        "button:has-text('Accept all')",
        "button:has-text('I agree')",
        "button:has-text('Accept')",
        "button:has-text('Agree')",
        "button:has-text('Got it')",
        "button[aria-label='Close']",
        "button[aria-label='close']",
        "[aria-label='Close']",
        "[aria-label='close']",
        "button:has-text('No thanks')",
    ]
    for sel in selectors:
        try:
            loc = page.locator(sel).first
            if await loc.is_visible(timeout=800):
                await loc.click(timeout=800)
                await page.wait_for_timeout(250)
        except Exception:
            pass


async def _wait_for_results(page: Page, site_name: str) -> None:
    candidates: list[str]
    if site_name == "Google Search":
        candidates = ["#search", "div#rso"]
    elif site_name == "Amazon":
        candidates = ["div.s-main-slot", "#search"]
    elif site_name == "Google Maps":
        candidates = ["div[role='main']", "#pane"]
    elif site_name == "BookMyShow":
        candidates = ["div:has-text('Movies')", "section", "main"]
    elif site_name == "Google Flights":
        candidates = ["div[role='main']", "main"]
    elif site_name == "Local":
        candidates = ["main", "#root", "#app", "body"]
    else:
        candidates = ["main", "body"]

    for sel in candidates:
        try:
            await page.locator(sel).first.wait_for(state="visible", timeout=8000)
            return
        except Exception:
            continue


async def _search_with_selectors(page: Page, query: str, selectors: list[str]) -> bool:
    for sel in selectors:
        try:
            box = page.locator(sel).first
            await box.wait_for(state="visible", timeout=5000)
            await box.click(timeout=2000)
            await box.fill("", timeout=2000)
            await box.type(query, delay=15)
            await box.press("Enter")
            return True
        except Exception:
            continue
    return False


async def run_task_search(
    req: TaskRequest,
    keep_open: bool,
    browser: str,
    start_url: Optional[str] = None,
) -> tuple[RoutedSite, str, str]:
    if start_url:
        routed = RoutedSite(name="Local", url=start_url, query=req.task)
    else:
        routed = route_task(req)

    async with async_playwright() as p:
        launch_kwargs: dict = {"headless": False}
        browser_name = (browser or "").strip().lower()
        try:
            if browser_name in {"msedge", "edge"}:
                pw_browser = await p.chromium.launch(channel="msedge", **launch_kwargs)
            elif browser_name in {"chrome", "google-chrome"}:
                pw_browser = await p.chromium.launch(channel="chrome", **launch_kwargs)
            elif browser_name in {"chromium", ""}:
                pw_browser = await p.chromium.launch(**launch_kwargs)
            elif browser_name == "firefox":
                pw_browser = await p.firefox.launch(**launch_kwargs)
            elif browser_name == "webkit":
                pw_browser = await p.webkit.launch(**launch_kwargs)
            else:
                pw_browser = await p.chromium.launch(channel=browser_name, **launch_kwargs)
        except Exception as e:
            raise RuntimeError(
                "Failed to launch browser. If you could not install Playwright browsers (e.g., disk full), "
                "try using a system browser channel: --browser msedge or --browser chrome. Original error: "
                + str(e)
            )
        context = await pw_browser.new_context()
        page = await context.new_page()

        await page.goto(routed.url, wait_until="domcontentloaded")
        await _dismiss_common_popups(page)

        searched = False
        if routed.name == "Local":
            searched = await _search_with_selectors(
                page,
                routed.query,
                [
                    "input[type='search']",
                    "input[placeholder*='search' i]",
                    "input[aria-label*='search' i]",
                    "input[name*='search' i]",
                    "textarea[placeholder*='search' i]",
                ],
            )
        elif routed.name == "BookMyShow":
            searched = await _search_with_selectors(
                page,
                routed.query,
                [
                    "input[placeholder*='Search']",
                    "input[aria-label*='Search']",
                    "input[type='search']",
                    "input[name='search']",
                ],
            )
        elif routed.name == "Amazon":
            searched = await _search_with_selectors(
                page,
                routed.query,
                [
                    "input#twotabsearchtextbox",
                    "input[name='field-keywords']",
                    "input[type='search']",
                ],
            )
        elif routed.name == "Google Maps":
            searched = await _search_with_selectors(
                page,
                routed.query,
                [
                    "input#searchboxinput",
                    "input[aria-label='Search Google Maps']",
                    "input[role='combobox']",
                ],
            )
        elif routed.name == "Google Flights":
            searched = await _search_with_selectors(
                page,
                routed.query,
                [
                    "input[aria-label='Where from?']",
                    "input[aria-label='Where to?']",
                    "input[role='combobox']",
                    "input[type='text']",
                ],
            )
        else:
            searched = await _search_with_selectors(
                page,
                routed.query,
                [
                    "textarea[name='q']",
                    "input[name='q']",
                    "input[type='search']",
                ],
            )

        if searched:
            await page.wait_for_load_state("domcontentloaded")
            await _dismiss_common_popups(page)
            await _wait_for_results(page, routed.name)
            await page.wait_for_timeout(400)

        final_url = page.url
        final_title = await page.title()

        if keep_open:
            try:
                input("Results page reached. Press Enter to close the browser...")
            except KeyboardInterrupt:
                pass

        await context.close()
        await pw_browser.close()

    return routed, final_url, final_title


def build_arg_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="web_task_agent", add_help=True)
    p.add_argument("task", help="Task to search for, e.g. 'Inception movie tickets'")
    p.add_argument("--location", default=None)
    p.add_argument("--datetime", default=None)
    p.add_argument("--preferences", default=None)
    p.add_argument("--keep-open", action="store_true", default=True)
    p.add_argument("--no-keep-open", dest="keep_open", action="store_false")
    p.add_argument(
        "--browser",
        default="chromium",
        help="Browser to use: chromium (bundled), msedge, chrome, firefox, webkit",
    )
    p.add_argument(
        "--start-url",
        default=None,
        help="Optional URL to start on (e.g., http://localhost:3000). If provided, bypasses site routing.",
    )
    return p


def prompt_if_missing(value: Optional[str], prompt: str) -> Optional[str]:
    if value is not None and value.strip() != "":
        return value
    s = input(prompt).strip()
    return s if s else None


async def main_async(argv: list[str]) -> int:
    args = build_arg_parser().parse_args(argv)

    if args.start_url:
        req = TaskRequest(task=args.task, location=args.location, datetime=args.datetime, preferences=args.preferences)
        routed, url, title = await run_task_search(
            req,
            keep_open=args.keep_open,
            browser=args.browser,
            start_url=args.start_url,
        )
        print(f"SITE: {routed.name}")
        print(f"SEARCH: {routed.query}")
        print(f"TITLE: {title}")
        print(f"URL: {url}")
        return 0

    req0 = TaskRequest(task=args.task, location=args.location, datetime=args.datetime, preferences=args.preferences)
    routed0 = route_task(req0)

    location = args.location
    dt = args.datetime
    prefs = args.preferences

    if routed0.name in {"BookMyShow", "Google Maps"}:
        location = prompt_if_missing(location, "Location (city/area): ")

    if routed0.name in {"BookMyShow", "Google Flights"}:
        dt = prompt_if_missing(dt, "Date/Time (optional, press Enter to skip): ")

    req = TaskRequest(task=args.task, location=location, datetime=dt, preferences=prefs)

    routed, url, title = await run_task_search(req, keep_open=args.keep_open, browser=args.browser)
    print(f"SITE: {routed.name}")
    print(f"SEARCH: {routed.query}")
    print(f"TITLE: {title}")
    print(f"URL: {url}")
    return 0


def main(argv: Optional[list[str]] = None) -> int:
    import sys

    if argv is None:
        argv = sys.argv[1:]
    return asyncio.run(main_async(argv))

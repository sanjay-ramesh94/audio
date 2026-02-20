from playwright.async_api import async_playwright, Page, Browser
import asyncio
from fastapi import WebSocket, WebSocketDisconnect
import json
import logging

class MeetingBot:
    def __init__(self, meet_url: str):
        self.meet_url = meet_url
        self.browser: Browser = None
        self.page: Page = None
        self.is_running = False
        self.transcribed_text = []

    async def start(self):
        self.is_running = True
        try:
            async with async_playwright() as p:
                self.browser = await p.chromium.launch(headless=False, args=[
                    "--use-fake-ui-for-media-stream",  # Auto-allow camera/mic
                    "--disable-blink-features=AutomationControlled" # Hide automation banner
                ])
                context = await self.browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                )
                self.page = await context.new_page()

                # Navigate to Meeting
                print(f"Bot joining: {self.meet_url}")
                await self.page.goto(self.meet_url)

                # Wait for "Continue without microphone" or permissions
                # We can try to dismiss the initial setup if it appears
                try:
                    # Look for input to type name
                    name_input = self.page.locator("input[placeholder='Your name']")
                    if await name_input.count() > 0:
                        await name_input.fill("AI Notetaker")
                        await asyncio.sleep(1)
                    
                    # Click "Ask to join" or "Join now"
                    join_buttons = self.page.locator("text='Ask to join'")
                    if await join_buttons.count() > 0:
                        await join_buttons.first.click()
                        print("Clicked 'Ask to join'")
                    else:
                        join_now = self.page.locator("text='Join now'")
                        if await join_now.count() > 0:
                            await join_now.first.click()
                            print("Clicked 'Join now'")
                
                except Exception as e:
                    print(f"Error during join flow: {e}")

                # Wait indefinitely while checking for captions
                # In a real implementation, we would scrape captions here
                # accessing the DOM periodically.
                
                print("Bot is in the meeting (or waiting for approval)...")

                while self.is_running:
                    # Keep browser open
                    await asyncio.sleep(1)

        except Exception as e:
            print(f"Bot crashed: {e}")
        finally:
            if self.browser:
                await self.browser.close()

    async def stop(self):
        self.is_running = False


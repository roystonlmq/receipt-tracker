# Receipts tracking app. This app allows users to track screenshots or receipts of messages that occur throughout the day, so that they can review it or reorganize it e.g. save the screenshot to a particular project folder at the end of the day. This acts like a photo album classified by folders with dates DDMMYYYY. Each screenshot will be titled "DDMMYY - HHMM - screenshot name.png". It uses Drizzle ORM to interact with the database. This app is built with Tanstack Start.

We will be using pnpm.

## Features
* Upload screenshots
* View screenshots
* Save screenshots
* Rename screenshots
* Screenshots are stored persistently in a database
* File explorer/folder navigation tool that auto uploads screenshots based on DDMMYY prefix. 
* Create profiles. Different user profiles are able to store their own screenshots that do not overlap with another user profile.

## Installation

```bash
pnpm install
```



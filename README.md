[![WebdriverIO](https://img.shields.io/badge/WebdriverIO-v8-green)](https://webdriver.io/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/) [![Cucumber](https://img.shields.io/badge/Cucumber-BDD-yellow)](https://cucumber.io/) ![Build Status](https://github.com/stuartsmith-test/e2e-wdio-cucumber/actions/workflows/wdio-ci.yml/badge.svg)

# E2E Automation: WebdriverIO + Cucumber (TypeScript)

## Overview

This repository is a personal initiative to explore **modern Node.js-based test automation patterns** through framework migration.

The project was generated using an **AI-First workflow** (Copilot/Claude) to achieve rapid porting of a [Python/Playwright architecture](https://github.com/stuartsmith-test/e2e-playwright) into a **TypeScript/WebdriverIO/Cucumber** environment. It demonstrates how domain-aware AI agents can accelerate framework setup and test generation.

### Technical Scope

* **Hybrid Framework:** Combines **WebdriverIO** (UI interactions) with **Axios** (API-based test data setup).
* **Page Object Model (POM):** Encapsulates locators and behaviors in dedicated classes (`HomePage`, `CartPage`) to maintain clean test logic.
* **Database Support:** Includes SQLite3 utilities for querying the application's database to verify backend state.
* **BDD with Cucumber:** Human-readable Gherkin feature files bound to TypeScript step definitions.
* **Automated CI Environment:** A GitHub Actions workflow that handles the full application lifecycle—cloning the SUT, starting the Node.js server, and running headless tests.

---

## Prerequisites

Before running these tests, ensure you have the necessary runtime environment.

### 1. Node.js (v16+)

This project requires Node.js.

* **Check version:** `node -v` and `npm -v`
* **Install:** [Download Node.js](https://nodejs.org/) or use a package manager (e.g., `brew install node`).

### 2. Git

To clone both this repo and the test application (app-under-test).

---

## Repo Structure

A quick map of files and folders so you can navigate the project efficiently.

The layout reflects a modern Page Object Model with BDD-style step definitions, keeping locators, interactions, and assertions cleanly separated for clarity and reuse.

```text
e2e-wdio-cucumber/
├── .github/
│   └── workflows/
│       └── wdio-ci.yml                  # CI: spins up app-under-test and runs tests
├── .gitignore
├── LICENSE                              # MIT License
├── README.md                            # Project overview + setup (this file)
├── package.json                         # Node.js dependencies & scripts
├── package-lock.json                    # Exact dependency versions
├── tsconfig.json                        # TypeScript configuration
├── wdio.conf.ts                         # WebdriverIO configuration (Cucumber setup)
├── screenshots/                         # Evidence of test execution
│   └── execution-report.png
├── features/                            # Cucumber feature files & implementation
│   ├── *.feature                        # Gherkin scenarios (user-readable tests)
│   ├── pageobjects/                     # Page Object Model
│   │   ├── page.ts                      # Base page (shared methods)
│   │   ├── home.page.ts                 # HomePage interactions & assertions
│   │   ├── cart.page.ts                 # CartPage interactions & assertions
│   │   └── checkout.page.ts             # CheckoutPage interactions & assertions
│   ├── step-definitions/                # Cucumber step implementations
│   │   └── *.steps.ts                   # Step definitions (Given/When/Then)
│   └── support/                         # Utilities & helpers
│       ├── api.utils.ts                 # Axios-based API client (setup via POST)
│       └── db.utils.ts                  # SQLite3-based database queries
└── allure-results/                      # Test results (gitignored)
```

---

## Setup & Configuration

### 1. Clone This Repository

```bash
git clone https://github.com/stuartsmith-test/e2e-wdio-cucumber.git
cd e2e-wdio-cucumber
```

### 2. Prepare the App Under Test

The tests run against the [Test Automation Foundations](https://github.com/stuartsmith-test/test-automation-foundations-728391) app (forked from LinkedIn Learning).

For a self-contained setup (recommended for Codespaces or new clones), clone the app into a child directory:

**Clone the app into a separate folder:**

```bash

git clone https://github.com/stuartsmith-test/test-automation-foundations-728391.git app-under-test
cd app-under-test
npm ci  # Clean install of dependencies
```

**Start the App:**

```bash
npm start
# The app will launch at http://localhost:3000
```

*(Leave this terminal window running)*

### 3. Install WebdriverIO Dependencies

Back in the `e2e-wdio-cucumber` folder:

```bash
npm ci
```

This installs WebdriverIO v8, Cucumber framework, TypeScript, Axios, SQLite3, and supporting tools.

### 4. Verify Configuration

Check that `wdio.conf.ts` has the correct base URL:

* **`baseUrl`:** `http://localhost:3000`

(Note: The `dbPath` is automatically handled by the configuration logic.)

---

## Running Tests

### Execute All Tests

```bash
npm test
```

### Run a Specific Feature

```bash
npx wdio run wdio.conf.ts --spec features/AddToCart.feature
```

### View Allure Report

After a test run:

```bash
npx allure-commandline generate allure-results --clean
npx allure-commandline open
```

---

## ☁️ Running in GitHub Codespaces (or Headless Linux)

### Install System Dependencies
Linux environments require system libraries (fonts, drivers) to run Chrome. Run this sequence once:

```bash
wget wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt-get update
sudo apt-get install -y ./google-chrome-stable_current_amd64.deb
```
### Run Tests
The framework automatically detects the environment and switches to Headless Mode.

```bash
npm test
```

---


## Comparison: Python vs. TypeScript

A quick reference for the architectural mapping between the source project and this port.

| Component | Python Implementation | TypeScript Implementation |
| :--- | :--- | :--- |
| **Test Runner** | `pytest` | `WebdriverIO + Cucumber` |
| **Setup/Teardown** | `conftest.py` (Fixtures) | `Before/After` hooks in steps |
| **API Client** | `playwright.request` | `axios` |
| **UI Interaction** | `page.get_by_role(...)` | `$()` WebdriverIO locators |
| **Database** | `sqlite3` sync calls | `sqlite3` callback-based |
| **Project Build** | `pip` / `requirements.txt` | `npm` / `package.json` |
| **Type Safety** | Type hints (optional) | TypeScript (strict) |

---

## Architecture & Design

### Page Object Model

* **[`home.page.ts`](features/pageobjects/home.page.ts)** — Homepage interactions: products, add-to-cart, cart count
* **[`cart.page.ts`](features/pageobjects/cart.page.ts)** — Cart interactions: items, quantity, total price
* **[`page.ts`](features/pageobjects/page.ts)** — Base class: shared navigation and utilities

### Static Utilities

* **[`api.utils.ts`](features/support/api.utils.ts)** — Axios client for API setup (reset cart, add items)
* **[`db.utils.ts`](features/support/db.utils.ts)** — SQLite3 queries for backend verification

### Cucumber (BDD)

Feature files are human-readable specifications. Step definitions in `features/step-definitions/` bind Gherkin to Page Objects and Utilities.

---

## License

This project is open source and available under the [MIT License](LICENSE).
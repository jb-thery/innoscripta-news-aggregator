import { expect, test } from "@playwright/test"
import { APP_PATHS } from "@signal-desk/contracts"

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("i18nextLng", "en")
  })
})

test("should search and filter articles with shareable URL state", async ({ page }) => {
  await page.goto("/?q=AI&providers=newsapi%2Cguardian%2Cnytimes")

  await expect(
    page.getByRole("heading", { level: 1, name: "Read across the noise." }),
  ).toBeVisible()
  await expect(page.locator("article")).toHaveCount(3)

  await page.getByRole("button", { name: "Show filters" }).click()
  await page.getByLabel("Category").selectOption("business")

  await expect(page).toHaveURL(/category=business/)
  await expect(page.getByText("No signal yet")).toBeVisible()
})

test("should persist personalized feed preferences after reload", async ({ page }) => {
  await page.goto(APP_PATHS.feed)

  const guardianPreference = page.getByRole("button", { name: "The Guardian" })
  await guardianPreference.click()
  await expect(guardianPreference).toHaveAttribute("aria-pressed", "true")
  await expect(page.locator("article")).toHaveCount(2)

  await page.reload()

  await expect(page.getByRole("button", { name: "The Guardian" })).toHaveAttribute(
    "aria-pressed",
    "true",
  )
  await expect(page.locator("article")).toHaveCount(2)
})

test("should switch the interface language without reloading", async ({ page }) => {
  await page.goto("/")

  await page.getByLabel("Language").selectOption("de")

  await expect(page.getByRole("heading", { level: 1, name: "Durch den Lärm lesen." })).toBeVisible()
  await expect(page.locator("html")).toHaveAttribute("lang", "de")
})

test("should span the viewport when the header renders", async ({ page }) => {
  await page.goto("/?q=AI&providers=newsapi%2Cguardian%2Cnytimes")

  const bounds = await page.locator(".site-header").evaluate((element) => {
    const rect = element.getBoundingClientRect()

    return {
      left: rect.left,
      right: rect.right,
      viewportWidth: document.documentElement.clientWidth,
    }
  })

  expect(bounds.left).toBe(0)
  expect(bounds.right).toBe(bounds.viewportWidth)
})

test("should expose published article links when demo data powers the feed", async ({ page }) => {
  await page.goto(APP_PATHS.feed)

  for (const source of ["NewsAPI.org", "The Guardian", "The New York Times"]) {
    await page.getByRole("button", { name: source, exact: true }).click()
  }

  const articleLinks = page.locator(".article-card__footer a")
  await expect(articleLinks).toHaveCount(6)

  const destinations = await articleLinks.evaluateAll((links) =>
    links.map((link) => (link instanceof HTMLAnchorElement ? link.href : "")),
  )

  expect(
    destinations.every(
      (destination) => destination.startsWith("https://") && !destination.includes("/mock/"),
    ),
  ).toBe(true)
})

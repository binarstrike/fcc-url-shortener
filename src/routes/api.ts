import { Router } from "express"
import dns from "dns"
import { promisify } from "util"

export const router = Router()
const lookup = promisify(dns.lookup)

type TShortUrl = {
  url: string
  id: number
}
let shortUrls: Array<TShortUrl> = []

router.get("/", (req, res) => {
  res.send("Hi")
})

router.post(
  "/shorturl",
  async (req, res, next) => {
    try {
      const hostname = new URL(req.body?.url)?.hostname
      const checkHostname = await lookup(hostname)
      if (!checkHostname.address || checkHostname.address === "202.3.218.138")
        res.json({ error: "invalid url" })
      else next()
    } catch (error) {
      res.json({ error: "invalid url" })
    }
  },
  (req, res) => {
    const url = req.body?.url

    const randomNumber = Math.floor(Math.random() * 10000 + 1)
    shortUrls.push({ url, id: randomNumber })
    res.json({
      original_url: url,
      short_url: randomNumber,
    })
  }
)

router.get("/shorturl/:id?", (req, res) => {
  const id = req.params?.id
  for (let i = 0; i < shortUrls.length; i++)
    if (shortUrls[i].id === parseInt(id))
      return res.redirect(301, shortUrls[i].url)

  res.json({ error: "invalid url" })
})

export default router

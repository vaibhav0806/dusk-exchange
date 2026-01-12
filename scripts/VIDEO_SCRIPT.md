# Dusk Exchange - Demo Video Script

**Duration**: 3 minutes max (Hackathon requirement)
**Format**: Screen recording + voiceover

---

## Timeline

| Time | Section | Content |
|------|---------|---------|
| 0:00-0:30 | Problem Statement | MEV attacks explained |
| 0:30-1:15 | Solution Demo | Trading on Dusk Exchange |
| 1:15-2:15 | MEV Attack Demo | Attacker's perspective |
| 2:15-2:45 | Technical Deep Dive | Architecture overview |
| 2:45-3:00 | Closing | Summary + CTA |

---

## Section 1: Problem Statement (0:00-0:30)

### Visual
- Start with Dusk Exchange logo animation
- Show MEV statistics graphic
- Animation of sandwich attack

### Script

> "Every day, DeFi traders lose millions to MEV attacks."
>
> [Show stat: $1.38 billion extracted in 2024]
>
> "When you place an order on a traditional DEX, attackers can see exactly what you're trying to do."
>
> [Animation: Order visible in mempool → Attacker front-runs → User gets worse price]
>
> "They sandwich your trade - buying before you, selling after - and pocket the difference."
>
> "But what if attackers couldn't see your orders at all?"

---

## Section 2: Solution Demo (0:30-1:15)

### Visual
- Live demo of Dusk Exchange frontend
- Show wallet connection
- Place an encrypted order

### Script

> "Introducing Dusk Exchange - the first MEV-protected DEX on Solana."
>
> [Show: Connect wallet to Dusk Exchange]
>
> "Let me show you how it works. I'll place a buy order for 10 SOL at $100."
>
> [Show: Fill in order form, click submit]
>
> "Notice something different? Before the order even leaves my browser, it's encrypted using Arcium's Multi-Party Computation."
>
> [Show: Encryption indicator in UI]
>
> "My order details - price and amount - are now unreadable to everyone except the MPC network."
>
> [Show: Transaction confirmation with encrypted data highlighted]
>
> "The order is on-chain, but no one can see what I'm actually trading."

---

## Section 3: MEV Attack Demo (1:15-2:15)

### Visual
- Split screen: Terminal (attacker view) + Frontend (user view)
- Run mev-demo.sh script
- Show encrypted vs plaintext data

### Script

> "Let's see what this looks like from an attacker's perspective."
>
> [Show: Terminal running mev-demo.sh]
>
> "On a traditional DEX, the attacker sees everything - BUY, 10 SOL, $100. Easy target."
>
> [Show: Traditional DEX section of demo]
>
> "They can calculate exactly how much to front-run, execute the sandwich, profit."
>
> [Show: Attack successful message]
>
> "Now let's try the same attack on Dusk Exchange."
>
> [Show: Dusk Exchange section of demo]
>
> "The attacker intercepts the transaction and sees... encrypted data."
>
> [Show: Encrypted price/amount in terminal]
>
> "They can't determine if it's a buy or sell. Can't see the price. Can't see the amount."
>
> "Without this information, sandwiching is impossible. The attack fails."
>
> [Show: Attack failed message]
>
> "Meanwhile, my order matches fairly with a seller, both getting the best possible price."

---

## Section 4: Technical Deep Dive (2:15-2:45)

### Visual
- Architecture diagram
- Code snippets (Arcis circuit)
- Flow animation

### Script

> "Under the hood, Dusk Exchange uses Arcium's MPC network for encrypted computation."
>
> [Show: Architecture diagram]
>
> "Orders are encrypted client-side using X25519 key exchange with the MPC nodes."
>
> [Show: Encryption flow]
>
> "The encrypted orderbook lives on Solana, but only the MPC network can process it."
>
> [Show: Arcis circuit code snippet]
>
> "When orders match, only the execution details are revealed - never the original order data."
>
> "This means your trading strategy stays private, forever."

---

## Section 5: Closing (2:45-3:00)

### Visual
- Dusk Exchange logo
- GitHub link
- Team credits

### Script

> "Dusk Exchange - trade without fear."
>
> [Show: Logo + tagline]
>
> "Built for the Solana Privacy Hackathon using Arcium MPC."
>
> [Show: GitHub URL, Arcium logo]
>
> "Check out the code, try the demo, and see for yourself."
>
> "Privacy isn't just a feature - it's the future of DeFi."
>
> [Fade to black with logo]

---

## Recording Checklist

### Before Recording

- [ ] Clean desktop, hide notifications
- [ ] Frontend running at localhost:3000
- [ ] Wallet connected with some balance
- [ ] Terminal ready with mev-demo.sh
- [ ] Microphone tested, quiet room

### Screen Recording Settings

- Resolution: 1920x1080
- Frame rate: 30fps
- Format: MP4 (H.264)
- Audio: Mono, 48kHz

### Recording Order

1. Record screen demos first (no voiceover)
2. Record voiceover separately
3. Edit together in video editor
4. Add transitions, graphics
5. Export final video

### Post-Production

- [ ] Add background music (subtle, royalty-free)
- [ ] Add captions/subtitles
- [ ] Color correct if needed
- [ ] Verify under 3 minutes
- [ ] Export in hackathon-required format

---

## Assets Needed

### Graphics

- [x] Dusk Exchange logo (app/public/)
- [ ] MEV statistics infographic
- [ ] Sandwich attack animation
- [ ] Architecture diagram
- [ ] Flow diagram

### Audio

- [ ] Background music track
- [ ] Sound effects (subtle clicks, transitions)

### Code Snippets to Show

```rust
// Arcis circuit - encrypted order matching
fn match_book(orderbook: Enc<Mxe, OrderBookState>) -> MatchResult {
    // Find best bid/ask - all encrypted
    let best_bid = find_best_order(orderbook, BUY);
    let best_ask = find_best_order(orderbook, SELL);

    // Check crossing condition
    if best_bid.price >= best_ask.price {
        // Calculate midpoint - still encrypted
        let exec_price = (best_bid.price + best_ask.price) / 2;

        // Only reveal execution details
        MatchResult {
            matched: true,
            price: exec_price.reveal(),  // <- Only this is revealed!
            amount: exec_amount.reveal(),
        }
    }
}
```

---

## Tips for Recording

1. **Speak slowly and clearly** - Viewers need time to process
2. **Pause on important screens** - Let visuals sink in
3. **Use mouse cursor deliberately** - Draw attention to key areas
4. **Keep energy high but professional**
5. **Practice the whole thing 2-3 times** before recording

---

## Backup Plans

### If frontend isn't working:
- Use the shell demo (mev-demo.sh) for the full demonstration
- Show architecture diagrams instead

### If time runs over:
- Cut technical deep dive to 15 seconds
- Focus on problem → solution → demo

### If audio quality is poor:
- Re-record just the voiceover
- Use text overlays as backup

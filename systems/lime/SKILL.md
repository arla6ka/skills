---
name: lime
description: Lime design system rules for this project's UI. Use when building or changing any screen, component, form or style, when porting an existing screen onto Lime, or when checking UI against Lime.
---

# Lime

Lime is a white page, warm-grey surfaces and near-black text with one acid lime on the main action, for consumer apps. Build with these components before writing markup.

## Steps
1. Pick the components the screen needs from the index below. Fetch each one's page before using it: it has the props, variants and that component's rules.
2. Build only from those components and the theme's tokens, inside an element with the "lime" class. Import each from the path in the index.
3. If a component or token is missing, stop and say which. Do not invent one.
4. Porting an existing screen: swap one piece at a time for its component, keep the behavior and copy, and delete the old styles once nothing uses them. For a whole app, run migrate-design-system when it is installed.
5. Done when every global rule holds for every line you touched and no raw color, size or font is left in it. Run ui-review on the screen when it is installed.

## Priority order
When rules conflict, the earlier item wins.
1. Accessibility and keyboard behavior
2. Tokens by role, never raw values
3. Existing components, never rebuilt
4. Spacing, radius and type scales
5. Polish: glow, motion, detail

## Global rules
1. lime-components-first MUST Use a Lime component before writing custom markup; fetch its page before you build.
   - Correct: `import {Button} from '@/components/lime/ui/button'`
2. lime-scope MUST Wrap Lime UI in className="lime" with LimePortalProvider inside it, so overlays keep the tokens.
   - Correct: `<div className="lime"><LimePortalProvider>{children}</LimePortalProvider></div>`
3. lime-tokens-only MUST Read roles such as --fg, --surface and --accent; never a hex value, arbitrary px or dark: variant.
   - Correct: `<p className="text-fg">`
   - Wrong: `<p className="text-[#0f0f0d]">`
4. lime-one-action MUST Use one lime primary action per view; every other action is solid, secondary, outline or ghost.
5. lime-lime-scarce NEVER Fill a page, card or section with lime, or put white text on it; text on lime is --on-accent.
6. lime-glow-scarce NEVER Add glow beyond primary and destructive buttons, the balance chip and one featured card.
7. lime-money-sign MUST Show money with its sign and currency in an Amount, in tabular figures, before the person moves it.
   - Correct: `<Amount value={-50}/>`
8. lime-ask-before-money MUST Show an ApprovalRequest before the assistant moves money and an ActionReceipt with Undo after.
   - Correct: `<ApprovalRequest title="Send Maya $24" amount={-24} reason="Your half of dinner"/>`
9. lime-field-label MUST Wrap every input in Field with a label above it; a placeholder is not a label.
   - Correct: `<Field name="title"><FieldLabel>Goal name</FieldLabel><Input/></Field>`
10. lime-focus MUST Keep every control keyboard-operable with the 2px olive :focus-visible ring; never outline: none.
11. lime-sentence-case SHOULD Write sentence case, a verb and its object on actions, and no emoji.
   - Correct: `<Button>Send money</Button>`
   - Wrong: `<Button>OK</Button>`
12. lime-missing MUST Stop and say so when a token or component is missing; do not invent one.

## Reject list
- No blue, no second brand hue, no gradient behind content, no colored shadows.
- No second icon set, no weight 700, no letter-spaced capitals.
- No transition: all, no looping animation except the spinner.

## Components

### Actions
- [Button](https://design.how/systems/lime/components/button.md): Starts an action, such as Send money. The lime primary is the one glowing action on a screen. `@/components/lime/ui/button`
- [Copy button](https://design.how/systems/lime/components/copy-button.md): Copies a value, such as a payment link, and confirms with a check. `@/components/lime/ui/copy-button`

### Inputs
- [Input](https://design.how/systems/lime/components/input.md): One line of text, such as a merchant name or a search. `@/components/lime/ui/input`
- [Textarea](https://design.how/systems/lime/components/textarea.md): Several lines of text, such as a note on a payment. `@/components/lime/ui/textarea`
- [Field](https://design.how/systems/lime/components/field.md): A label, a control, a hint and an error, wired together. `@/components/lime/ui/field`
- [Select](https://design.how/systems/lime/components/select.md): One choice from a list, such as an account or a category. `@/components/lime/ui/select`
- [Combobox](https://design.how/systems/lime/components/combobox.md): A searchable choice from a long list, such as friends or merchants. `@/components/lime/ui/combobox`
- [Dropzone](https://design.how/systems/lime/components/dropzone.md): A target for receipts and statements, with type and size checks. `@/components/lime/ui/dropzone`
- [Keypad](https://design.how/systems/lime/components/keypad.md): The number pad for entering an amount on a phone, such as how much to send. `@/components/lime/ui/keypad`

### Selection
- [Checkbox](https://design.how/systems/lime/components/checkbox.md): One option on or off, with a mixed state. `@/components/lime/ui/checkbox`
- [Radio](https://design.how/systems/lime/components/radio.md): One choice from a short visible list, such as a transfer speed. `@/components/lime/ui/radio`
- [Switch](https://design.how/systems/lime/components/switch.md): A setting that applies at once, such as round-ups. `@/components/lime/ui/switch`
- [Slider](https://design.how/systems/lime/components/slider.md): A value or a range on a track, such as a monthly savings amount. `@/components/lime/ui/slider`
- [Segmented](https://design.how/systems/lime/components/segmented.md): A short row of exclusive options, such as Week, Month and Year. `@/components/lime/ui/segmented`
- [Chip](https://design.how/systems/lime/components/chip.md): A filter the person toggles, such as a spending category. `@/components/lime/ui/chip`

### Display
- [Badge](https://design.how/systems/lime/components/badge.md): A short fact that never changes on its own, such as Plus or New. `@/components/lime/ui/badge`
- [Avatar](https://design.how/systems/lime/components/avatar.md): A person, such as a friend you split a bill with, with initials as the fallback. `@/components/lime/ui/avatar`
- [Card](https://design.how/systems/lime/components/card.md): A grouped block, such as a savings goal or a card, on warm grey, outlined or raised. `@/components/lime/ui/card`
- [Table](https://design.how/systems/lime/components/table.md): Rows of transactions you scan across, with amounts at the end. `@/components/lime/ui/table`
- [List](https://design.how/systems/lime/components/list.md): Rows of transactions, accounts or settings, each with a mark, a title and a value or a chevron. `@/components/lime/ui/list`
- [Progress](https://design.how/systems/lime/components/progress.md): How far a goal has come, such as $640 of $1,000 saved, as a bar or a ring. `@/components/lime/ui/progress`
- [Amount](https://design.how/systems/lime/components/amount.md): A money amount with its sign, currency and tabular figures. `@/components/lime/ui/amount`
- [Bill schedule](https://design.how/systems/lime/components/bill-schedule.md): The bills coming up in date order, each under a date tile, with who pays it. `@/components/lime/ui/bill-schedule`
- [Balance](https://design.how/systems/lime/components/balance.md): The amount left in an account, kept in the header. `@/components/lime/ui/balance`

### Feedback
- [Status](https://design.how/systems/lime/components/status.md): The state of a payment as a dot and a word. `@/components/lime/ui/status`
- [Empty](https://design.how/systems/lime/components/empty.md): An empty state with one action, such as Add a card. `@/components/lime/ui/empty`

### Overlays
- [Dialog](https://design.how/systems/lime/components/dialog.md): A focused task over a scrim, such as sending money. `@/components/lime/ui/dialog`
- [Alert dialog](https://design.how/systems/lime/components/alert-dialog.md): A blocking decision, such as deleting a goal, that cannot be dismissed from outside. `@/components/lime/ui/alert-dialog`
- [Sheet](https://design.how/systems/lime/components/sheet.md): A panel from an edge, such as transaction details, that keeps the page visible. `@/components/lime/ui/sheet`
- [Popover](https://design.how/systems/lime/components/popover.md): An anchored panel with controls, such as splitting a bill. `@/components/lime/ui/popover`
- [Dropdown menu](https://design.how/systems/lime/components/dropdown-menu.md): A list of commands behind a button. `@/components/lime/ui/dropdown-menu`
- [Tooltip](https://design.how/systems/lime/components/tooltip.md): A short label on hover and focus. `@/components/lime/ui/tooltip`

### Navigation
- [Tabs](https://design.how/systems/lime/components/tabs.md): Switches between views of one list, such as Activity and Scheduled. `@/components/lime/ui/tabs`
- [Toolbar](https://design.how/systems/lime/components/toolbar.md): A row of related controls with one tab stop. `@/components/lime/ui/toolbar`

### Layout
- [Accordion](https://design.how/systems/lime/components/accordion.md): A stack of questions that open one at a time. `@/components/lime/ui/accordion`
- [Separator](https://design.how/systems/lime/components/separator.md): A hairline between groups. `@/components/lime/ui/separator`
- [Scroll area](https://design.how/systems/lime/components/scroll-area.md): A scrolling region with a slim thumb. `@/components/lime/ui/scroll-area`

### Assistant
- [Chat input](https://design.how/systems/lime/components/chat-input.md): The box a request to the assistant is written in, with the amount and send. `@/components/lime/ai/chat-input`
- [Message](https://design.how/systems/lime/components/message.md): One turn in a conversation with the assistant. `@/components/lime/ai/message`
- [Tool call](https://design.how/systems/lime/components/tool-call.md): One step the assistant took, such as Moved $50 to Vacation fund, as a single line. `@/components/lime/ai/tool-call`
- [Follow ups](https://design.how/systems/lime/components/follow-ups.md): Suggested next requests under an answer. `@/components/lime/ai/follow-ups`
- [Approval request](https://design.how/systems/lime/components/approval-request.md): The assistant asking before it moves money, with the amount, one reason, and Approve, Edit or Decline. `@/components/lime/ai/approval-request`
- [Action receipt](https://design.how/systems/lime/components/action-receipt.md): A message listing what the assistant just did, one line per action, with Undo. `@/components/lime/ai/action-receipt`
- [Autonomy rule](https://design.how/systems/lime/components/autonomy-rule.md): How far the assistant may go on its own, as one sentence with the limit typed into it. `@/components/lime/ai/autonomy-rule`
- [Receipt match](https://design.how/systems/lime/components/receipt-match.md): A receipt paired with its payment, with whether the two match. `@/components/lime/ai/receipt-match`
- [Insight](https://design.how/systems/lime/components/insight.md): One thing the assistant noticed, as a sentence, the number behind it and a tiny line. `@/components/lime/ai/insight`

## Foundations
- [Color](https://design.how/systems/lime/foundations/color.md): The colors Lime uses, and where each one goes.
- [Typography](https://design.how/systems/lime/foundations/typography.md): The typeface, sizes and weights Lime uses for every word and number.
- [Spacing](https://design.how/systems/lime/foundations/spacing.md): How much room goes between things, and how tall controls are.
- [Radius](https://design.how/systems/lime/foundations/radius.md): How round each corner is, from pill buttons to softer panels.
- [Elevation](https://design.how/systems/lime/foundations/elevation.md): How things stack, using grey steps and a soft shadow for what floats.
- [Motion](https://design.how/systems/lime/foundations/motion.md): How things move, quickly and only when something changes.
- [Iconography](https://design.how/systems/lime/foundations/iconography.md): One set of simple line icons, drawn in the same color as the text.

## Add a component
npx shadcn@latest add @lime/<name>, the name being the last part of its page link.

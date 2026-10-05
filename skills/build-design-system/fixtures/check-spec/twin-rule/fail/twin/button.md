# Button

Starts an action, such as Save changes.

## Rules
1. button-one-primary MUST Use one primary Button per view.
   - Correct: `<Button>Save changes</Button>`
2. button-no-div NEVER Build a button from a div, because a div takes no focus and no Enter key.
   - Correct: `<Button onClick={save}>Save</Button>`
3. button-label SHOULD Start the label with a verb.
4. button-icon-only MUST Give an icon-only Button an aria-label, because a screen reader reads nothing else.
   - Correct:
     ```tsx
     <Button size="icon" aria-label="Close">
       <Icon icon={Close} />
     </Button>
     ```
5. button-no-nest NEVER Put a Button inside a link, because two controls share one tab stop.
   - Wrong:
     ```tsx
     <a href="/new"><Button>New</Button></a>
     ```
   - Correct: `<Button render={<a href="/new" />}>New</Button>`

'use client';

import {useState} from 'react';
import {Input} from '../ui/input';
import {List, ListItem} from '../ui/list';
import {Switch} from '../ui/switch';

// A block: settings as standing rules, one row each. PaydayRule is what happens to money on payday,
// AssistantLimits what the assistant may do without asking.

/** Payday, as three standing rules in one list, so every row shares the list's padding: a title, a second line and a
 * switch. The first rule's second line holds the amount to move, editable in place. No glow. */
export function PaydayRule() {
  const [save, setSave] = useState('200');
  const [onPayday, setOnPayday] = useState(true);
  const [roundUps, setRoundUps] = useState(false);
  const [billsFirst, setBillsFirst] = useState(true);
  return (
    <List aria-label="Payday rules" className="w-full max-w-sm">
      {/* The amount is an inline field one text line tall, so this row's second line is as tall as the next row's. Its
          width follows its text in ch, so it fits whatever size the field's text is (touch screens set inputs to 16px). */}
      <ListItem title="Save when paid" description={<span className="flex items-center gap-1.5">
        Move
        <Input size="sm" aria-label="Amount to move on payday" value={`$${save}`} onChange={e => setSave(e.target.value.replace(/[^0-9]/g, ''))} disabled={!onPayday} inputMode="numeric" style={{width: `calc(${save.length + 1}ch + 0.75rem + 2px)`}} className="h-5 shrink-0 rounded-sm px-1.5 text-center text-sm font-medium tabular-nums focus-visible:-outline-offset-2"/>
        to savings
      </span>} trailing={<Switch checked={onPayday} onCheckedChange={setOnPayday} aria-label="Save when paid"/>}/>
      <ListItem title="Bills first" description="Hold what's due before anything moves" trailing={<Switch checked={billsFirst} onCheckedChange={setBillsFirst} aria-label="Bills first"/>}/>
      <ListItem title="Round ups" description="Spare change goes to savings" trailing={<Switch checked={roundUps} onCheckedChange={setRoundUps} aria-label="Round ups"/>}/>
    </List>
  );
}

/** What the assistant may do without asking, as a settings list: one row per limit, the value at the end. */
export function AssistantLimits() {
  const [limit, setLimit] = useState('50');
  const [days, setDays] = useState('3');
  const [ask, setAsk] = useState(true);
  return (
    <List aria-label="Assistant limits" className="w-full max-w-sm">
      <ListItem title="Ask before paying over" trailing={<Input size="sm" aria-label="Limit in dollars" value={`$${limit}`} onChange={e => setLimit(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" className="w-16 text-end"/>}/>
      <ListItem title="Pay bills early" description="Days before they're due" trailing={<Input size="sm" aria-label="Days early" value={days} onChange={e => setDays(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" className="w-16 text-end"/>}/>
      <ListItem title="Tell me after it acts" trailing={<Switch checked={ask} onCheckedChange={setAsk} aria-label="Tell me after it acts"/>}/>
    </List>
  );
}

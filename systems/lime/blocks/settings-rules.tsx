'use client';

import {useState} from 'react';
import {AutonomyRule} from '../ai/autonomy-rule';
import {List, ListItem} from '../ui/list';
import {Switch} from '../ui/switch';

// A block: settings as standing rules, one row each. PaydayRule is what happens to money on payday,
// AssistantLimits what the assistant may do without asking.

/** Payday, as three standing rules in one list, so every row shares the list's padding: a title, a second line and a
 * switch. The first rule's second line is an inline AutonomyRule, the amount to move editable in place, one text line
 * tall so the row is as tall as the next. No glow. */
export function PaydayRule() {
  const [save, setSave] = useState('200');
  const [onPayday, setOnPayday] = useState(true);
  const [roundUps, setRoundUps] = useState(false);
  const [billsFirst, setBillsFirst] = useState(true);
  return (
    <List aria-label="Payday rules" className="w-full max-w-sm">
      <ListItem title="Save when paid" description={<AutonomyRule size="inline" before="Move" after="to savings" value={save} onValueChange={setSave} disabled={!onPayday}/>}
        trailing={<Switch checked={onPayday} onCheckedChange={setOnPayday} aria-label="Save when paid"/>}/>
      <ListItem title="Bills first" description="Hold what's due before anything moves" trailing={<Switch checked={billsFirst} onCheckedChange={setBillsFirst} aria-label="Bills first"/>}/>
      <ListItem title="Round ups" description="Spare change goes to savings" trailing={<Switch checked={roundUps} onCheckedChange={setRoundUps} aria-label="Round ups"/>}/>
    </List>
  );
}

/** What the assistant may do without asking, as a settings list: one row per limit. A limit is an inline
 * AutonomyRule on the row's second line, the same shape as PaydayRule. */
export function AssistantLimits() {
  const [limit, setLimit] = useState('50');
  const [days, setDays] = useState('3');
  const [tellAfter, setTellAfter] = useState(true);
  return (
    <List aria-label="Assistant limits" className="w-full max-w-sm">
      <ListItem title="Ask before paying" description={<AutonomyRule size="inline" before="Anything over" value={limit} onValueChange={setLimit}/>}/>
      <ListItem title="Pay bills early" description={<AutonomyRule size="inline" kind="number" after="days before they're due" value={days} onValueChange={setDays}/>}/>
      <ListItem title="Tell me after it acts" trailing={<Switch checked={tellAfter} onCheckedChange={setTellAfter} aria-label="Tell me after it acts"/>}/>
    </List>
  );
}

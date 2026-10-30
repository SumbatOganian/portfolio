import {Fragment} from 'react';

// Reserve complete words so revealing characters never changes the line breaks.
// Screen readers receive the full sentence once, rather than character updates.
export function ScrollTypeText({text}:{text:string}){
 return <><span className="about-type-readable">{text}</span><span aria-hidden="true">{text.split(/(\s+)/).map((part,i)=>part.trim()?<span className="about-type-word" key={i}>{Array.from(part).map((letter,j)=><span className="about-type-char" key={j}>{letter}</span>)}</span>:<Fragment key={i}>{Array.from(part).map((letter,j)=><span className="about-type-char" key={j}>{letter}</span>)}</Fragment>)}</span></>;
}

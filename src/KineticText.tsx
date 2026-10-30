import {Fragment,type CSSProperties} from 'react';
export function KineticText({text,className=''}:{text:string,className?:string}){
 let index=0;
 return <span className={`kinetic-text ${className}`} aria-label={text}>{text.split(' ').map((word,i)=><Fragment key={i}><span className="kinetic-word-wrap" aria-hidden="true"><span className="kinetic-word">{Array.from(word).map((char,j)=><span key={j} className="kinetic-char" style={{'--i':index++} as CSSProperties}>{char}</span>)}</span></span>{i<text.split(' ').length-1?' ':null}</Fragment>)}</span>;
}

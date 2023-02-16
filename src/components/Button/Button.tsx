import * as React from 'react'
import './Button.scss'

type Props = {
  onClick?(): void;
  disabled?: boolean;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset'
};

export function Button (props: Props) {
  return (
    <button
      className="button"
      onClick={props.onClick}
      disabled={props.disabled}
      type={props.type}
    >
      {props.children}
    </button>
  )
}

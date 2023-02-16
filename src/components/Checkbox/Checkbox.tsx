import * as React from 'react'

import './Checkbox.module.css'

export interface CheckboxProps {
    label: string;
    isChecked: boolean;
    changed: any,
}

export interface CheckboxState {
    isChecked: boolean;
}

export default class Checkbox extends React.Component<CheckboxProps, CheckboxState> {
    public displayName: string = 'checkbox';

    constructor (props: CheckboxProps) {
      super(props)
      this.state = {
        isChecked: this.props.isChecked
      }
    }

    static getDerivedStateFromProps (props: CheckboxProps, state: CheckboxState) {
      if (props.isChecked !== state.isChecked) {
        return {
          isChecked: props.isChecked
        }
      }
      return null
    }

    onChange = (event: any) => {
      if (this.props.changed) {
        this.props.changed(this.props.label, !this.state.isChecked)
      }
    }

    render () {
      const label: string = this.props.label
      const isChecked: boolean = this.state.isChecked

      return (
            <div className="Checkbox">
                <label>
                    <input type="checkbox" value={label} checked={isChecked} onChange={this.onChange} /> {label}
                </label>
            </div>
      )
    }
}

import * as React from 'react'
// import Select from 'react-select';

// Note: Not using react-select because it generates warnings in strict mode

import './Dropdown.css'

export type DropdownOption = {
    label: string;
    value: string;
}

export type DropdownOptions = DropdownOption[];

export interface DropdownProps {
    name: string;
    options: DropdownOptions;
    selectedOption: DropdownOption;
    changed: any;
}

export interface DropdownState {
}

export default class Dropdown extends React.Component<DropdownProps, DropdownState> {
    onChangeSelect = (event: any) => {
      const value: string = event.target.value
      if (this.props.changed) {
        this.props.changed(this.props.name, value)
      }
    }

    render () {
      const optionsSelect: any[] = []
      this.props.options.forEach(option => {
        optionsSelect.push(<option key={option.value} value={option.value}>{option.label}</option>)
      })
      const currentValue: string = this.props.selectedOption ? this.props.selectedOption.value : ''

      return (
            <div className='Dropdown'>
                <select id={this.props.name} name={this.props.name} value={currentValue} onChange={this.onChangeSelect}>
                    {optionsSelect}
                </select>
            </div>
      )
    }
}

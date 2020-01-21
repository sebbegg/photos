import React, { Component } from "react";

class Dropdown extends Component {
    constructor(props) {
        super(props);
        this.state = { selected: { id: null } };
        this.handleDropdownClicked = this.handleDropdownClicked.bind(this);
    }

    handleDropdownClicked(item) {
        let newValue = item;
        if (this.state.selected.id !== item.id) {
            this.setState({ selected: item });
        } else {
            newValue = null;
            this.setState({ selected: { id: null } });
        }
        if (this.props.onSelectionChanged) {
            this.props.onSelectionChanged(newValue);
        }
    }

    render() {
        const dropdownItems = this.props.items.map(it => {
            const iCls =
                "far " + (it.id === this.state.selected.id ? "fa-check-square" : "fa-square");
            return (
                <button
                    className="button dropdown-item is-white"
                    key={it.id}
                    href="#"
                    onClick={() => this.handleDropdownClicked(it)}
                >
                    <i className={iCls} style={{ marginRight: "1em" }} />
                    {it.text}
                </button>
            );
        });

        return (
            <div className="dropdown is-hoverable is-right">
                <div className="dropdown-trigger">
                    <button className="button" aria-haspopup="true" aria-controls="dropdown-menu">
                        <span className="icon">
                            <i className={this.props.icon} />
                        </span>
                        <span>
                            {this.state.selected.id === null
                                ? this.props.noSelectionText
                                : this.state.selected.text}
                        </span>
                    </button>
                </div>
                <div className="dropdown-menu" id="dropdown-menu" role="menu">
                    <div className="dropdown-content">{dropdownItems}</div>
                </div>
            </div>
        );
    }
}

export default Dropdown;

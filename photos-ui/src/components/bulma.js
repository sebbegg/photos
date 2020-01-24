import React from "react";
import _ from "lodash";

function getClassName(init, props) {
    let classNames = Array.from(init);
    if (props.active) {
        classNames.push("is-active");
    }
    if (props.className) {
        classNames.push(props.className.split(" "));
    }
    return classNames.join(" ");
}

function unusedProps(props) {
    return _.omit(props, ["active", "className", "children"]);
}

function DropDown(props) {
    const classNames = getClassName(["dropdown"], props);
    return (
        <div className={classNames} {...unusedProps(props)}>
            <div className="dropdown-trigger">{props.trigger}</div>
            <div className="dropdown-menu" id="dropdown-menu" role="menu">
                <div className="dropdown-content">{props.children}</div>
            </div>
        </div>
    );
}

function DropDownItem(props) {
    const classNames = getClassName(["dropdown-item"], props);

    return (
        <div className={classNames} {...unusedProps(props)}>
            {props.children}
        </div>
    );
}

export { DropDown, DropDownItem };

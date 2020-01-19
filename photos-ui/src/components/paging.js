import React from "react";


function PagingControl(props) {

    function makeElem(page, isCurrent) {
        const cls = "pagination-link" + (isCurrent ? " is-current" : "");
        const label = `${isCurrent ? "" : "Goto "} Page ${page}`;

        return (
            <li key={page}>
                <a className={cls} aria-label={label} onClick={() => props.onClick(page)}>{page}</a>
            </li>
        );
    }

    function makeEllipsis(key) {
        return (<li key={key}><span className="pagination-ellipsis">&hellip;</span></li>);
    }

    if (props.pageCount <= 1) {
        return null;
    }
    let pageingElems = [];
    const mStart = Math.max(1, props.currentPage-1);
    const mEnd = Math.min(props.pageCount, props.currentPage+1);

    if (mStart > 1) {
        pageingElems.push(makeElem(1, 1 === props.currentPage));
    }
    if (mStart === 3) {
        pageingElems.push(makeElem(2, 2 === props.currentPage));
    }
    if (mStart > 3) {
        pageingElems.push(makeEllipsis("ellipsis-1"));
    }
    for (let i = mStart; i <= mEnd; i++) {
        pageingElems.push(makeElem(i, i === props.currentPage));
    }
    if (mEnd === props.pageCount-2) {
        pageingElems.push(makeElem(props.pageCount-1, props.pageCount-1 === props.currentPage));
    }
    if (mEnd < props.pageCount-2) {
        pageingElems.push(makeEllipsis("ellipsis-2"));
    }
    if (mEnd < props.pageCount) {
        pageingElems.push(makeElem(props.pageCount, props.pageCount === props.currentPage));
    }


    let onNextClick, onPrevClick = undefined;
    if (props.currentPage > 1) {
        onPrevClick = () => props.onClick(props.currentPage-1);
    }
    if (props.currentPage < props.pageCount) {
        onNextClick = () => props.onClick(props.currentPage+1);
    }

    return (
        <nav className="pagination is-small" role="navigation" aria-label="pagination">

            <a key="prev" className="pagination-previous" onClick={onPrevClick}
               disabled={onPrevClick===undefined}><i className="far fa-caret-square-left"/>
            </a>
            <a key="next" className="pagination-next" onClick={onNextClick}
               disabled={onNextClick===undefined}><i className="far fa-caret-square-right"/>
            </a>
            <ul key="list" className="pagination-list">
                {pageingElems}
            </ul>
        </nav>
    );
}

export default PagingControl;
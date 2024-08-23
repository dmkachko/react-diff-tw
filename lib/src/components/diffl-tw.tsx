import {cn} from '../utils/utils.ts';
import {computeLineInformation, DiffMethod, DiffType, DiffViewCell, DiffViewLine,} from './compute-lines';
import {useMemo, useState} from "react";
import {mapValues} from "lodash";
import React from 'react';

export enum LineNumberPrefix {
    LEFT = 'L',
    RIGHT = 'R',
}

export interface DifflTwProps {
    // Old value to compare.
    oldValue: string;
    // New value to compare.
    newValue: string;
    // Enable/Disable split view.
    splitView?: true; // todo implement inline view
    // Set line Offset
    linesOffset?: number;
    // Enable/Disable word diff.
    disableWordDiff?: boolean;
    // JsDiff text diff method from https://github.com/kpdecker/jsdiff/tree/v4.0.1#api
    compareMethod?: DiffMethod;
    // Number of unmodified lines surrounding each line diff.
    extraLinesSurroundingDiff?: number;
    // Show/hide line number.
    hideLineNumbers?: boolean;
    // Show only diff between the two values.
    showDiffOnly?: boolean;
    // Render prop to format final string before displaying them in the UI.
    renderContent?: (source: string) => JSX.Element;
    // Render prop to format code fold message.
    codeFoldMessageRenderer?: (
        totalFoldedLines: number,
        leftStartLineNumber: number,
        rightStartLineNumber: number,
    ) => JSX.Element;
    // Event handler for line number click.
    onLineNumberClick?: (
        lineId: string,
        event: React.MouseEvent<HTMLTableCellElement>,
    ) => void;
    // Array of line ids to highlight lines.
    highlightLines?: string[];
    // Use dark theme.
    useDarkTheme?: boolean;
    // Title for left column
    leftTitle?: string | JSX.Element;
    // Title for left column
    rightTitle?: string | JSX.Element;

    // Style overrides.
    styles: Record<string, string>;

    className?: string;
}


const defaultStyles = {
    emptyGutter: '',
    diffAdded: 'bg-green-200',
    wordAdded: 'bg-green-300',
    diffRemoved: 'bg-red-200',
    wordRemoved: 'bg-red-300',
    highlightedGutter: '',
    lineNumber: 'w-4 text-right',
    marker: 'w-4 text-center',
    gutter: 'w-12 text-gray-400',
    wordDiff: '',
    emptyLine: '',
    highlightedLine: '',
    content: '',
    contentText: '',
    line: '',
    splitView: '',
    titleBlock: '',
    codeFold: 'text-xs font-bold italic underline sans-serif cursor-pointer bg-gray-100 text-gray-600',
    codeFoldGutter: 'bg-gray-100',
    codeFoldContent: '',
    
}

const defaultProps: DifflTwProps = {
    oldValue: '',
    newValue: '',
    splitView: true,
    highlightLines: [],
    disableWordDiff: false,
    compareMethod: DiffMethod.CHARS,
    styles: defaultStyles,
    hideLineNumbers: false,
    extraLinesSurroundingDiff: 3,
    showDiffOnly: true,
    useDarkTheme: false,
    linesOffset: 0,
};


export const DifflTw: React.FC<DifflTwProps> = (props) => {

    const _props = useMemo(() => ({...defaultProps, ...props}), [props]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const styles = useMemo(() => mapValues({...defaultStyles, ...props.styles}, (v, k) => cn(v, defaultStyles[k] || '' as string, props.styles[k])), [props.styles]);

    const [expandedBlocks, setExpandedBlocks] = useState<number[]>([]);
    // const resetCodeBlocks = () => setExpandedBlocks(b => b.length > 0 ? [] : b);

    const onBlockExpand = (id: number): void => {
        setExpandedBlocks(prevState => [...prevState, id]);
    };

    const renderWordDiff = ( // todo factor out
        diffArray: DiffViewCell[],
        renderer?: (chunk: string) => JSX.Element,
    ): JSX.Element[] => {
        return diffArray.map(
            (wordDiff, i): JSX.Element => {
                return (
                    <span
                        key={i}
                        className={cn(styles.wordDiff, {
                            [styles.wordAdded]: wordDiff.type === DiffType.ADDED,
                            [styles.wordRemoved]: wordDiff.type === DiffType.REMOVED,
                        })}>
                        {renderer ? renderer(wordDiff.value as string) : wordDiff.value as string}
                </span>
                );
            },
        );
    };

    const renderLine = (
        lineNumber: number,
        type: DiffType,
        prefix: LineNumberPrefix,
        value: string | DiffViewCell[],
        additionalLineNumber?: number,
        additionalPrefix?: LineNumberPrefix,
    ): JSX.Element => {
        const lineNumberTemplate = `${prefix}-${lineNumber}`;
        const additionalLineNumberTemplate = `${additionalPrefix}-${additionalLineNumber}`;
        const highlightLine =
            _props.highlightLines!.includes(lineNumberTemplate) ||
            _props.highlightLines!.includes(additionalLineNumberTemplate);
        const added = type === DiffType.ADDED;
        const removed = type === DiffType.REMOVED;
        let content;
        if (Array.isArray(value)) {
            content = renderWordDiff(value, _props.renderContent);
        } else if (_props.renderContent) {
            content = _props.renderContent(value);
        } else {
            content = value;
        }

        return (
            <>
                {!_props.hideLineNumbers && (
                    <td
                        onClick={() => {
                        }
                            // lineNumber && this.onLineNumberClickProxy(lineNumberTemplate) todo fix
                        }
                        className={cn(styles.gutter, {
                            [styles.emptyGutter]: !lineNumber,
                            [styles.diffAdded]: added,
                            [styles.diffRemoved]: removed,
                            [styles.highlightedGutter]: highlightLine,
                        })}>
                        <pre className={styles.lineNumber}>
                            {lineNumber || ''}</pre>
                    </td>
                )}
                {!_props.splitView && !_props.hideLineNumbers && (
                    <td
                        // onClick={
                        //     additionalLineNumber &&
                        //     // onLineNumberClickProxy(additionalLineNumberTemplate) todo fix
                        // }
                        className={cn(styles.gutter, {
                            [styles.emptyGutter]: !additionalLineNumber,
                            [styles.diffAdded]: added,
                            [styles.diffRemoved]: removed,
                            [styles.highlightedGutter]: highlightLine,
                        })}>
                        <pre className={styles.lineNumber}>{additionalLineNumber}</pre>
                    </td>
                )}
                <td
                    className={cn(styles.marker, {
                        [styles.emptyLine]: !content,
                        [styles.diffAdded]: added,
                        [styles.diffRemoved]: removed,
                        [styles.highlightedLine]: highlightLine,
                    })}>
        <pre>
            {added && '+'}
            {removed && '-'}
        </pre>
                </td>
                <td
                    className={cn(styles.content, {
                        [styles.emptyLine]: !content,
                        [styles.diffAdded]: added,
                        [styles.diffRemoved]: removed,
                        [styles.highlightedLine]: highlightLine,
                    })}>
                    <pre className={styles.contentText}>{content}</pre>
                </td>
            </>
        );
    };

    const renderSplitView = (
        {left, right}: DiffViewLine,
        index: number,
    ): JSX.Element => {
        return (
            <tr key={index} className={styles.line}>
                {!!left && renderLine(
                    left.lineNumber || 0,
                    left.type!,
                    LineNumberPrefix.LEFT,
                    left.value!,
                )}
                {!!right && renderLine(
                    right.lineNumber || 0,
                    right.type!,
                    LineNumberPrefix.RIGHT,
                    right.value!,
                )}
            </tr>
        );
    };

    const renderSkippedLineIndicator = (
        num: number,
        blockNumber: number,
        leftBlockLineNumber: number,
        rightBlockLineNumber: number,
    ): JSX.Element => {
        const {hideLineNumbers, splitView} = _props;
        const message = _props.codeFoldMessageRenderer ? (
            _props.codeFoldMessageRenderer(
                num,
                leftBlockLineNumber,
                rightBlockLineNumber,
            )
        ) : (
            <pre className={styles.codeFoldContent}>Expand {num} lines ...</pre>
        );
        const content = (
            <td>
                <a onClick={() => onBlockExpand(blockNumber)} tabIndex={0}>
                    {message}
                </a>
            </td>
        );
        const isUnifiedViewWithoutLineNumbers = !splitView && !hideLineNumbers;
        return (
            <tr
                key={`${leftBlockLineNumber}-${rightBlockLineNumber}`}
                className={styles.codeFold}>
                {!hideLineNumbers && <td className={styles.codeFoldGutter}/>}
                <td
                    className={cn({
                        [styles.codeFoldGutter]: isUnifiedViewWithoutLineNumbers,
                    })}
                />

                {/* Swap columns only for unified view without line numbers */}
                {isUnifiedViewWithoutLineNumbers ? (
                    <>
                        <td/>
                        {content}
                    </>
                ) : (
                    <>
                        {content}
                        <td/>
                    </>
                )}

                <td/>
                <td/>
            </tr>
        );
    };


    const renderDiff = (): (JSX.Element | null)[] => {
        const {
            oldValue,
            newValue,
            disableWordDiff,
            compareMethod,
            linesOffset,
            extraLinesSurroundingDiff
        } = _props;

        const {lineViews, lineNumbers} = computeLineInformation(
            oldValue,
            newValue,
            disableWordDiff,
            compareMethod,
            linesOffset,
        );

        const extraLines =
            !extraLinesSurroundingDiff || (extraLinesSurroundingDiff < 0)
                ? 0
                : extraLinesSurroundingDiff;

        let skippedLines: number[] = [];

        return lineViews.map(
            (line: DiffViewLine, i: number): JSX.Element | null => {
                const diffBlockStart = lineNumbers[0];
                const currentPosition = diffBlockStart - i;
                if (_props.showDiffOnly) {
                    if (currentPosition === -extraLines) {
                        skippedLines = [];
                        lineNumbers.shift();
                    }
                    if (
                        line.left!.type === DiffType.DEFAULT &&
                        (currentPosition > extraLines ||
                            typeof diffBlockStart === 'undefined') &&
                        !expandedBlocks.includes(diffBlockStart)
                    ) {
                        skippedLines.push(i + 1);
                        if (i === lineViews.length - 1 && skippedLines.length > 1) {
                            return renderSkippedLineIndicator(
                                skippedLines.length,
                                diffBlockStart,
                                line.left!.lineNumber || 0, // todo fix,
                                line.right!.lineNumber || 0, // todo fix,
                            );
                        }
                        return null;
                    }
                }

                const diffNodes = renderSplitView(line, i)

                if (currentPosition === extraLines && skippedLines.length > 0) {
                    const {length} = skippedLines;
                    skippedLines = [];
                    return (
                        <React.Fragment key={i}>
                            {renderSkippedLineIndicator(
                                length,
                                diffBlockStart,
                                line.left!.lineNumber || 0, // todo fix
                                line.right!.lineNumber || 0,
                            )}
                            {diffNodes}
                        </React.Fragment>
                    );
                }
                return diffNodes;
            },
        );
    };

    const {
        leftTitle,
        rightTitle,
        splitView,
        hideLineNumbers,
    } = _props;

    const nodes = renderDiff();
    const colSpanOnSplitView = hideLineNumbers ? 2 : 3;
    const colSpanOnInlineView = hideLineNumbers ? 2 : 4;

    const title = (leftTitle || rightTitle) && (
        <tr>
            <td
                colSpan={splitView ? colSpanOnSplitView : colSpanOnInlineView}
                className={styles.titleBlock}>
                <pre className={styles.contentText}>{leftTitle}</pre>
            </td>
            {splitView && (
                <td colSpan={colSpanOnSplitView} className={styles.titleBlock}>
                    <pre className={styles.contentText}>{rightTitle}</pre>
                </td>
            )}
        </tr>
    );

    return (
        <table className={cn('w-full', _props.className, {[styles.splitView]: splitView})}>
            <tbody>{title}{nodes}</tbody>
        </table>

    );
};


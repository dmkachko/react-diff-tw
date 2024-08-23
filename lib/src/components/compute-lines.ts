import * as diff from 'diff';
import {Change} from "diff";

export enum DiffType {
    DEFAULT = 0,
    ADDED = 1,
    REMOVED = 2,
}

// See https://github.com/kpdecker/jsdiff/tree/v4.0.1#api for more info on the below JsDiff methods
export enum DiffMethod {
    CHARS = 'diffChars',
    WORDS = 'diffWords',
    WORDS_WITH_SPACE = 'diffWordsWithSpace',
    LINES = 'diffLines',
    TRIMMED_LINES = 'diffTrimmedLines',
    SENTENCES = 'diffSentences',
    CSS = 'diffCss',
}

export interface DiffViewCell  {
    value: string | DiffViewCell[];
    type: DiffType;
    lineNumber?: number;
}

export interface DiffViewLine {
    left: DiffViewCell;
    right: DiffViewCell;
}

export interface ComputedLineInformation {
    lineViews: DiffViewLine[];
    lineNumbers: number[];
}

export interface ComputedDiffInformation {
    leftCell: DiffViewCell[];
    rightCell: DiffViewCell[];
}

// See https://github.com/kpdecker/jsdiff/tree/v4.0.1#change-objects for more info on JsDiff
// Change Objects
// export interface JsDiffChangeObject {
//     added?: boolean;
//     removed?: boolean;
//     value?: string;
// }

/**
 * Splits diff text by new line and computes final list of diff lines based on
 * conditions.
 *
 * @param value Diff text from the js diff module.
 */
const constructLines = (value: string): string[] => {
    const lines = value.split('\n');
    const isAllEmpty = lines.every((val): boolean => !val);
    if (isAllEmpty) {
        // This is to avoid added an extra new line in the UI.
        if (lines.length === 2) {
            return [];
        }
        lines.pop();
        return lines;
    }

    const lastLine = lines[lines.length - 1];
    const firstLine = lines[0];
    // Remove the first and last element if they are new line character. This is
    // to avoid addition of extra new line in the UI.
    if (!lastLine) {
        lines.pop();
    }
    if (!firstLine) {
        lines.shift();
    }
    return lines;
};

/**
 * Computes word diff information in the line.
 * [TODO]: Consider adding options argument for JsDiff text block comparison
 *
 * @param oldValue Old word in the line.
 * @param newValue New word in the line.
 * @param compareMethod JsDiff text diff method from https://github.com/kpdecker/jsdiff/tree/v4.0.1#api
 */
const computeDiff = (
    oldValue: string,
    newValue: string,
    compareMethod: DiffMethod = DiffMethod.CHARS,
): ComputedDiffInformation => {
    const diffArray: Change[] = diff[compareMethod](
        oldValue,
        newValue,
    );
    
    const computedDiff: ComputedDiffInformation = {
        leftCell: [],
        rightCell: [],
    };
    
    diffArray.forEach(
        ({ added, removed, value }) => {
            if (added) {
                computedDiff.rightCell.push({type: DiffType.ADDED, value});
            }
            if (removed) {
                computedDiff.leftCell.push({type: DiffType.REMOVED, value});
            }
            if (!removed && !added) {
                computedDiff.rightCell.push({type: DiffType.DEFAULT, value});
                computedDiff.leftCell.push({type: DiffType.DEFAULT, value});
            }
        },
    );
    return computedDiff;
};

const computeLineInformation = (
    oldString: string,
    newString: string,
    disableWordDiff: boolean = false,
    compareMethod: DiffMethod = DiffMethod.CHARS,
    linesOffset: number = 0,
): ComputedLineInformation => {
    const diffArray = diff.diffLines(
        oldString.trimRight(),
        newString.trimRight(),
        {
            newlineIsToken: true,
            ignoreWhitespace: false,
            ignoreCase: false,
        },
    );
    let rightLineNumber = linesOffset;
    let leftLineNumber = linesOffset;
    let lineInformation: DiffViewLine[] = [];
    let counter = 0;
    const diffLines: number[] = [];
    const ignoreDiffIndexes: string[] = [];
    
    const getLineInformation = (
        value: string,
        diffIndex: number,
        added?: boolean,
        removed?: boolean,
        evaluateOnlyFirstLine?: boolean,
    ): DiffViewLine[] => {
        const lines = constructLines(value);
        return lines
            .map(
                (line: string, lineIndex): DiffViewLine | undefined => {
                    const left: Partial<DiffViewCell> = {};
                    const right: Partial<DiffViewCell> = {};
                    if (
                        ignoreDiffIndexes.includes(`${diffIndex}-${lineIndex}`) ||
                        (evaluateOnlyFirstLine && lineIndex !== 0)
                    ) {
                        return undefined;
                    }
                    if (added || removed) {
                        if (!diffLines.includes(counter)) {
                            diffLines.push(counter);
                        }
                        if (removed) {
                            leftLineNumber += 1;
                            left.lineNumber = leftLineNumber;
                            left.type = DiffType.REMOVED;
                            left.value = line || ' ';
                            // When the current line is of type REMOVED, check the next item in
                            // the diff array whether it is of type ADDED. If true, the current
                            // diff will be marked as both REMOVED and ADDED. Meaning, the
                            // current line is a modification.
                            const nextDiff = diffArray[diffIndex + 1];
                            if (nextDiff && nextDiff.added) {
                                const nextDiffLines = constructLines(nextDiff.value)[lineIndex];
                                const lineInfo = getLineInformation(
                                    nextDiff.value,
                                    diffIndex,
                                    true,
                                    false,
                                    true,
                                )?.[0];
                                if (nextDiffLines && lineInfo?.right) {
                                    const {
                                        value: rightValue,
                                        lineNumber,
                                        type,
                                    } = lineInfo.right;
                                    // When identified as modification, push the next diff to ignore
                                    // list as the next value will be added in this line computation as
                                    // right and left values.
                                    ignoreDiffIndexes.push(`${diffIndex + 1}-${lineIndex}`);
                                    right.lineNumber = lineNumber;
                                    right.type = type;
                                    // Do word level diff and assign the corresponding values to the
                                    // left and right diff information object.
                                    if (disableWordDiff) {
                                        right.value = rightValue;
                                    } else {
                                        const computedDiff = computeDiff(
                                            line,
                                            rightValue as string,
                                            compareMethod,
                                        );
                                        right.value = computedDiff.rightCell;
                                        left.value = computedDiff.leftCell;
                                    }
                                }
                            }
                        } else {
                            rightLineNumber += 1;
                            right.lineNumber = rightLineNumber;
                            right.type = DiffType.ADDED;
                            right.value = line;
                        }
                    } else {
                        leftLineNumber += 1;
                        rightLineNumber += 1;

                        left.lineNumber = leftLineNumber;
                        left.type = DiffType.DEFAULT;
                        left.value = line;
                        right.lineNumber = rightLineNumber;
                        right.type = DiffType.DEFAULT;
                        right.value = line;
                    }
                    counter += 1;
                    return { right: right as DiffViewCell, left: left as DiffViewCell};
                },
            )
            .filter(v => !!v);
    };

    diffArray.forEach(({ added, removed, value }: diff.Change, index: number): void => {
        lineInformation = [
            ...lineInformation || {},
            ...getLineInformation(value, index, added, removed) || {},
        ];
    });

    return {
        lineViews: lineInformation,
        lineNumbers: diffLines,
    };
};

export { computeLineInformation };

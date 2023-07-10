"use sctrict";

module.exports = function (obj) {
    const [labels, alternativesArray] = extractData(obj.alternatives.data);

    //Создание массива параметров
    const importance = extractParametr(obj.parameters.importance);
    const indifference = extractParametr(obj.parameters.indifference);
    const superiority = extractParametr(obj.parameters.superiority);
    const veto = extractParametr(obj.parameters.veto);

    const THRESHOLD_FOR_ASCDENGING_SEQUENCE = +obj.parameters.treshold.tresholdAsc;
    const THRESHOLD_FOR_DESCDENGING_SEQUENCE = +obj.parameters.treshold.tresholdDesc;

    //change alternativesCount
    const alternativesArrayLength = alternativesArray.length;
    //change parametersCount
    const rowLength = alternativesArray[0].length;

    const weightSum = importance.reduce((acc, cur) => acc + cur, 0);

    //Матрица согласия
    const agreementMatrix = createAgreementMatrix();

    //Матрица доверия
    const trustMatrix = createTrustMatrix();

    //Вспомогательные матрицы
    const maxInTrustMatrix = findMax(trustMatrix);

    const addresess = Array.from(Array(trustMatrix.length).keys());

    const THRESHOLD_FOR_ASCDENGING_RANKING = maxInTrustMatrix - THRESHOLD_FOR_ASCDENGING_SEQUENCE * maxInTrustMatrix;
    const additionalMatrix = createAdditionalMatrix(trustMatrix, THRESHOLD_FOR_ASCDENGING_RANKING);

    const resultSequence = [];
    createAscendingRanking(resultSequence, additionalMatrix, addresess);

    const THRESHOLD_FOR_DESCDENGING_RANKING = maxInTrustMatrix - THRESHOLD_FOR_DESCDENGING_SEQUENCE * maxInTrustMatrix;
    const additionalMatrixForDescendingRanking = createAdditionalMatrix(trustMatrix, THRESHOLD_FOR_DESCDENGING_RANKING);

    const resultSequence2 = [];
    createDescendingRanking(resultSequence2, additionalMatrixForDescendingRanking, addresess);

    const resultArray = createResultArray();

    return resultArray;
    // #region

    function extractData(data) {
        const alternativesCount = Object.keys(data).length;
        const parametersCount = Object.keys(data[0]).length - 1;

        const alternatives = new Array(alternativesCount).fill(null).map(() => Array(parametersCount).fill(-1));

        const labels = new Array(alternativesCount);

        for (let i = 0; i < alternativesCount; i++) {
            const alternative = data[i];

            labels[i] = alternative.label;

            let index = 0;
            for (let param in alternative) {
                if (param === "label") {
                    continue;
                }
                alternatives[i][index] = alternative[param];
                index++;
            }
        }

        return [labels, alternatives];
    }

    function extractParametr(parameterObj) {
        const length = Object.keys(parameterObj).length;

        const array = new Array(length);
        let index = 0;

        for (let filed in parameterObj) {
            array[index] = +parameterObj[filed];
            index++;
        }
        return array;
    }

    function createAgreementMatrix() {
        const agreementMatrix = Array(alternativesArrayLength)
            .fill(null)
            .map(() => Array(alternativesArrayLength).fill(-1));

        for (let i = 0; i < alternativesArrayLength; i++) {
            const firstRow = alternativesArray[i];

            for (let j = 0; j < alternativesArrayLength; j++) {
                if (i === j) {
                    agreementMatrix[i][j] = 1;
                    continue;
                }

                const secondRow = alternativesArray[j];

                const compareResult = compareTwoAlternativesForAgreementMatrix(firstRow, secondRow);

                const value = +(compareResult.reduce((acc, cur) => acc + cur, 0) / weightSum).toFixed(2);

                agreementMatrix[j][i] = value;
            }
        }

        return agreementMatrix;
    }

    function compareTwoAlternativesForAgreementMatrix(firstAlternative, secondAlternative) {
        const resultArray = new Array(firstAlternative.length);

        for (let k = 0; k < rowLength; k++) {
            const diff = firstAlternative[k] - secondAlternative[k];

            if (diff <= indifference[k]) {
                resultArray[k] = importance[k];
            } else if (indifference[k] < diff && diff <= superiority[k]) {
                let t =
                    (secondAlternative[k] - firstAlternative[k] + superiority[k]) / (superiority[k] - indifference[k]);
                resultArray[k] = importance[k] * t;
            } else {
                resultArray[k] = 0;
            }
        }

        return resultArray;
    }

    function createTrustMatrix() {
        const trustMatrix = Array(alternativesArrayLength)
            .fill(null)
            .map(() => Array(alternativesArrayLength).fill(0));

        for (let i = 0; i < alternativesArrayLength; i++) {
            const firstRow = alternativesArray[i];

            for (let j = 0; j < alternativesArrayLength; j++) {
                if (i === j) {
                    trustMatrix[i][j] = 1;
                    continue;
                }
                const secondRow = alternativesArray[j];

                const tmpRow = [];
                for (let k = 0; k < rowLength; k++) {
                    const diff = secondRow[k] - firstRow[k];

                    const grade = createValueForTrustMatrix(diff, k);

                    if (grade < 1) {
                        tmpRow.push(grade);
                    } else {
                        trustMatrix[i][j] = 0;
                        tmpRow.push(grade);
                        break;
                    }
                }

                if (tmpRow.length === rowLength) {
                    trustMatrix[i][j] = calculateReductionFactor(i, j, tmpRow);
                }
            }
        }

        return trustMatrix;
    }

    function createValueForTrustMatrix(diff, index) {
        let result = 0;
        if (diff <= superiority[index]) {
            result = 0;
        } else if (superiority[index] < diff && diff <= veto[index]) {
            result = +((diff - superiority[index]) / (veto[index] - superiority[index])).toFixed(2);
        } else {
            result = 1;
        }
        return result;
    }

    function calculateReductionFactor(i, j, disagreementGrades) {
        let tmp = 1;
        const agrMatrixElementValue = agreementMatrix[i][j];

        for (let k = 0; k < disagreementGrades.length; k++) {
            if (agrMatrixElementValue <= disagreementGrades[k]) {
                tmp *= (1 - disagreementGrades[k]) / (1 - agrMatrixElementValue);
            }
        }

        return +(tmp * agrMatrixElementValue).toFixed(2);
    }

    function createAscendingRanking(resultMatrix, matrix, addressesInAdditionalMatrix) {
        const sequence = createSequence(matrix);
        const indices = findIndicesOfMaximumElements(sequence);

        const indicesOfNonMaxElements = findIndicesOfNonMaximumElements(indices, sequence);

        if (indices.length < sequence.length) {
            const addressesForMaxBranch = new Array(indices.length);

            for (let i = 0; i < indices.length; i++) {
                addressesForMaxBranch[i] = addressesInAdditionalMatrix[indices[i]];
            }
            createAscendingRanking(resultMatrix, extractElementsByIndices(matrix, indices), addressesForMaxBranch);

            const addressesForMinBranch = new Array(indicesOfNonMaxElements.length);
            for (let i = 0; i < indicesOfNonMaxElements.length; i++) {
                addressesForMinBranch[i] = addressesInAdditionalMatrix[indicesOfNonMaxElements[i]];
            }

            createAscendingRanking(
                resultMatrix,
                extractElementsByIndices(matrix, indicesOfNonMaxElements),
                addressesForMinBranch
            );
        } else if (indices.length === 1) {
            resultMatrix.push([labels[addressesInAdditionalMatrix[0]]]);
            return;
        } else if (sequence.length === indices.length) {
            const tmp = [];
            for (let i = 0; i < indices.length; i++) {
                tmp.push(labels[addressesInAdditionalMatrix[i]]);
            }
            resultMatrix.push(tmp);
            return;
        }
    }

    function createDescendingRanking(resultMatrix, matrix, addressesInAdditionalMatrix) {
        const sequence = createSequence(matrix);
        const indices = findIndicesOfMinimunElements(sequence);

        const indicesOfNonMaxElements = findIndicesOfNonMinumumElements(indices, sequence);

        if (indices.length < sequence.length) {
            const addressesForMaxBranch = new Array(indices.length);
            for (let i = 0; i < indices.length; i++) {
                addressesForMaxBranch[i] = addressesInAdditionalMatrix[indices[i]];
            }
            createDescendingRanking(resultMatrix, extractElementsByIndices(matrix, indices), addressesForMaxBranch);

            const addressesForMinBranch = new Array(indicesOfNonMaxElements.length);
            for (let i = 0; i < indicesOfNonMaxElements.length; i++) {
                addressesForMinBranch[i] = addressesInAdditionalMatrix[indicesOfNonMaxElements[i]];
            }
            createDescendingRanking(
                resultMatrix,
                extractElementsByIndices(matrix, indicesOfNonMaxElements),
                addressesForMinBranch
            );
        } else if (indices.length === 1) {
            resultMatrix.push([labels[addressesInAdditionalMatrix[0]]]);
            return;
        } else if (sequence.length === indices.length) {
            const tmp = [];
            for (let i = 0; i < indices.length; i++) {
                tmp.push(labels[addressesInAdditionalMatrix[i]]);
            }
            resultMatrix.push(tmp);
            return;
        }
    }

    function findMax(additionalMatrix) {
        const length = additionalMatrix[0].length;
        const arr = new Array(length);

        for (let i = 0; i < length; i++) {
            arr[i] = Math.max(...additionalMatrix[i]);
        }

        return Math.max(...arr);
    }

    function createAdditionalMatrix(trustMatrix, trashholdWithMax) {
        const length = trustMatrix[0].length;
        const additionalMatrix = new Array(length).fill(null).map(() => Array(length).fill(0));

        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length; j++) {
                if (trashholdWithMax <= trustMatrix[i][j]) {
                    additionalMatrix[i][j] = 1;
                }
            }
        }

        return additionalMatrix;
    }

    function createSequence(additionalMatrix) {
        const rowsSums = calcSumsInRow(additionalMatrix);
        const columnsSums = calcSumsInColumns(additionalMatrix);

        const arrayLength = additionalMatrix[0].length;

        const tmp = new Array(arrayLength).fill(0);
        for (let i = 0; i < arrayLength; i++) {
            tmp[i] = rowsSums[i] - columnsSums[i];
        }

        return tmp;
    }

    function calcSumsInRow(additionalMatrix) {
        const arrayLength = additionalMatrix[0].length;
        const sums = new Array(arrayLength).fill(0);

        for (let i = 0; i < arrayLength; i++) {
            const row = additionalMatrix[i];
            for (let j = 0; j < arrayLength; j++) {
                sums[i] += row[j];
            }
        }
        return sums;
    }

    function calcSumsInColumns(additionalMatrix) {
        const arrayLength = additionalMatrix[0].length;
        const sums = new Array(arrayLength).fill(0);

        for (let i = 0; i < arrayLength; i++) {
            const row = additionalMatrix[i];
            for (let j = 0; j < arrayLength; j++) {
                sums[j] += row[j];
            }
        }
        return sums;
    }

    function findIndicesOfMaximumElements(sequence) {
        const tmp = [];

        const max = Math.max(...sequence);
        for (let i = 0; i < sequence.length; i++) {
            if (sequence[i] === max) {
                tmp.push(i);
            }
        }
        return tmp;
    }

    function findIndicesOfMinimunElements(sequence) {
        const tmp = [];

        const max = Math.min(...sequence);
        for (let i = 0; i < sequence.length; i++) {
            if (sequence[i] === max) {
                tmp.push(i);
            }
        }
        return tmp;
    }

    function findIndicesOfNonMaximumElements(indicesOfMaximumElements, sequence) {
        const tmp = [];

        for (let i = 0; i < sequence.length; i++) {
            if (indicesOfMaximumElements.includes(i)) {
                continue;
            }
            tmp.push(i);
        }
        return tmp;
    }

    function findIndicesOfNonMinumumElements(indicesOfMinumumElements, sequence) {
        const tmp = [];

        for (let i = 0; i < sequence.length; i++) {
            if (indicesOfMinumumElements.includes(i)) {
                continue;
            }
            tmp.push(i);
        }
        return tmp;
    }

    function extractElementsByIndices(additionalMatrix, indices) {
        const extractedElements = [];

        const length = additionalMatrix[0].length;
        for (let i = 0; i < length; i++) {
            if (!indices.includes(i)) {
                continue;
            }

            const tmp = [];
            for (let j = 0; j < length; j++) {
                if (!indices.includes(j)) {
                    continue;
                }

                tmp.push(additionalMatrix[i][j]);
            }
            extractedElements.push(tmp);
        }

        return extractedElements;
    }

    function createResultArray() {
        const resultArray = [];

        for (let i = resultSequence2.length - 1; i >= 0; i--) {
            let tmp = [];
            const elem1 = resultSequence2[i];
            for (let k = 0; k < elem1.length; k++) {
                for (let x = 0; x < resultSequence.length; x++) {
                    const elem2 = resultSequence[x];

                    for (let f = 0; f < elem2.length; f++) {
                        if (elem1[k] === elem2[f]) {
                            tmp.push(elem1[k]);

                            elem2[f] = "";

                            if (k === elem1.length - 1) {
                                if (tmp.length !== 0) {
                                    resultArray.push(tmp);
                                }

                                tmp = [];
                            }

                            if (f === elem2.length - 1) {
                                if (tmp.length !== 0) {
                                    resultArray.push(tmp);
                                }

                                tmp = [];
                            }
                        }
                    }
                }
                elem1[k] = "";
            }
            if (tmp.length !== 0) {
                resultArray.push(tmp);
            }
        }

        return resultArray;
    }
    // #endregion
};

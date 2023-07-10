"use strict";

module.exports = function (obj) {
    const [labels, alternativesArray] = extractData(obj.alternatives.data);

    const agreementLevel = +obj.parameters.attitude.agreement;
    const disagreemenLevel = +obj.parameters.attitude.disagreement;

    const importance = extractParametr(obj.parameters.importance);

    const alternativesArrayLength = alternativesArray.length;
    const rowLength = alternativesArray[0].length;

    const weightSum = importance.reduce((acc, cur) => acc + cur, 0);

    const differenceOfMaxAndMinInParametrs = calcucalteDifferenecreBetweenMaxAndMinInParameters();

    const [agreementMatrix, disagreementMatrix] = createMatrices();

    const relationships = createRelationshipsBetweenAlternatives();

    const ranking = createRankingNEW(relationships);

    const rankedLabels = craeteLabelsForRanking(ranking);

    return rankedLabels;

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

    function calcucalteDifferenecreBetweenMaxAndMinInParameters() {
        const differenceOfMaxAndMinInParametrs = new Array(rowLength);
        for (let i = 0; i < rowLength; i++) {
            const tmp = new Array(alternativesArrayLength);
            for (let j = 0; j < alternativesArrayLength; j++) {
                tmp[j] = alternativesArray[j][i];
            }
            differenceOfMaxAndMinInParametrs[i] = Math.max(...tmp) - Math.min(...tmp);
        }
        return differenceOfMaxAndMinInParametrs;
    }

    function createMatrices() {
        const agreementMatrix = Array(alternativesArrayLength)
            .fill(null)
            .map(() => Array(alternativesArrayLength).fill(-1));

        const disagreementMatrix = Array(alternativesArrayLength)
            .fill(null)
            .map(() => Array(alternativesArrayLength).fill(-1));

        for (let i = 0; i < alternativesArrayLength; i++) {
            const firstRow = alternativesArray[i];

            for (let j = 0; j < alternativesArrayLength; j++) {
                const indiciesOfCriteriesWhichNotWorst = [];

                const indiciesOfCriteriesWhichWorst = [];

                const secondRow = alternativesArray[j];

                for (let k = 0; k < rowLength; k++) {
                    if (firstRow[k] === secondRow[k] || firstRow[k] >= secondRow[k]) {
                        indiciesOfCriteriesWhichNotWorst.push(k);
                    } else {
                        const value = (secondRow[k] - firstRow[k]) / differenceOfMaxAndMinInParametrs[k];
                        indiciesOfCriteriesWhichWorst.push(value);
                    }
                }

                let sumBestAndEquals = 0;
                for (let f = 0; f < indiciesOfCriteriesWhichNotWorst.length; f++) {
                    sumBestAndEquals += importance[indiciesOfCriteriesWhichNotWorst[f]];
                }
                agreementMatrix[i][j] = +(sumBestAndEquals / weightSum).toFixed(2);
                disagreementMatrix[i][j] =
                    indiciesOfCriteriesWhichWorst.length > 0
                        ? +Math.max(...indiciesOfCriteriesWhichWorst).toFixed(2)
                        : 0;
            }
        }

        return [agreementMatrix, disagreementMatrix];
    }

    function createRelationshipsBetweenAlternatives() {
        const relationships = [];
        for (let i = 0; i < agreementMatrix[0].length; i++) {
            for (let j = 0; j < agreementMatrix[0].length; j++) {
                if (i === j) {
                    continue;
                }
                if (agreementLevel <= agreementMatrix[i][j] && disagreementMatrix[i][j] <= disagreemenLevel) {
                    relationships.push([i, j]);
                }
            }
        }
        return relationships;
    }

    function createRankingNEW(arrayOfRelationships) {
        const ranking = [[]];

        for (let [dominant, dominated] of arrayOfRelationships) {
            let [isFounded, dominantPartAddress] = findAddress(ranking, dominant);

            if (!isFounded) {
                ranking[0].push(dominant);
                dominantPartAddress = 0;
            }

            const [isFoundedRight, dominatedPartAddress] = findAddress(ranking, dominated);

            if (isFoundedRight) {
                if (dominantPartAddress > dominatedPartAddress) {
                    ranking[dominatedPartAddress].push(dominant);

                    ranking[dominantPartAddress].splice(ranking[dominantPartAddress].indexOf(dominant), 1);

                    if (ranking[dominantPartAddress].length === 0) {
                        ranking.splice(dominantPartAddress, 1);
                    }
                }
                if (dominantPartAddress === dominatedPartAddress) {
                    if (typeof ranking[dominantPartAddress - 1] !== "undefined") {
                        ranking[dominantPartAddress - 1].push(dominant);
                        ranking[dominantPartAddress].splice(ranking[dominantPartAddress].indexOf(dominant), 1);
                    } else {
                        ranking.unshift([dominant]);
                        ranking[dominantPartAddress + 1].splice(ranking[dominantPartAddress + 1].indexOf(dominant), 1);
                    }
                }
            } else {
                if (typeof ranking[dominantPartAddress + 1] !== "undefined") {
                    ranking[dominantPartAddress + 1].push(dominated);
                } else {
                    ranking.push([dominated]);
                }
            }
        }
        return ranking;
    }

    function findAddress(array, value) {
        let address = undefined;

        return [
            Boolean(
                array.find((elem, index) => {
                    if (elem.includes(value)) {
                        address = index;
                        return true;
                    } else {
                        return false;
                    }
                })
            ),
            address,
        ];
    }

    function craeteLabelsForRanking(array) {
        const rankedLabels = [];
        for (let rank of array) {
            const tmp = [];

            for (let alternative of rank) {
                tmp.push(labels[alternative]);
            }
            rankedLabels.push(tmp);
        }
        return rankedLabels;
    }
};

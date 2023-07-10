"use sctrict";

module.exports = function (obj) {
    const [labels, alternativesArray] = extractData(obj.alternatives.data);
    const importance = extractParametr(obj.parameters.importance);

    const normalizedAlternatives = doMinMaxNormalize(alternativesArray);

    const addСonvolution = additiveСonvolution(normalizedAlternatives, importance);

    const pairs = createPairs(addСonvolution, labels);
    const sortedPairs = sortPairs(pairs);

    const ranking = createRanking(sortedPairs);

    return ranking;

    function extractData(data) {
        const alternativesCount = Object.keys(data).length;
        const parametersCount = Object.keys(data[0]).length - 1;

        const alternatives = new Array(parametersCount).fill(null).map(() => Array(alternativesCount).fill(-1));

        const labels = new Array(alternativesCount);

        for (let i = 0; i < alternativesCount; i++) {
            const alternative = data[i];
            labels[i] = alternative.label;

            let index = 0;

            for (let param in alternative) {
                if (index === 0) {
                    index++;
                    continue;
                }

                alternatives[index - 1][i] = +alternative[param];
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

    function doMinMaxNormalize(alternativesArray) {
        const alternativesNormalized = new Array(alternativesArray[0].length)
            .fill(null)
            .map(() => Array(alternativesArray.length).fill(-1));

        for (let i = 0; i < alternativesArray.length; i++) {
            const elem = alternativesArray[i];

            const max = findMax(elem);
            const min = findMin(elem);

            let diff = max - min;
            diff = diff === 0 ? 0.1 : diff;

            for (let j = 0; j < elem.length; j++) {
                let value = (elem[j] - min) / diff;

                value = value === 0 ? 0.001 : +value.toFixed(2);
                alternativesNormalized[j][i] = value;
            }
        }

        return alternativesNormalized;
    }

    function findMax(arr) {
        return Math.max(...arr);
    }
    function findMin(arr) {
        return Math.min(...arr);
    }

    function additiveСonvolution(normalizedAlternatives, importance) {
        const result = new Array(normalizedAlternatives.length).fill(null);

        for (let i = 0; i < normalizedAlternatives.length; i++) {
            const elem = normalizedAlternatives[i];

            let sum = 0;
            for (let j = 0; j < elem.length; j++) {
                sum += elem[j] * importance[j];
            }
            result[i] = +sum.toFixed(3);
        }

        return result;
    }

    function createPairs(addСonvolution, labels) {
        const pairs = new Array(addСonvolution.length);

        for (let i = 0; i < addСonvolution.length; i++) {
            pairs[i] = [labels[i], addСonvolution[i]];
        }

        return pairs;
    }

    function sortPairs(pairs) {
        return pairs.sort((a, b) => {
            return b[1] - a[1];
        });
    }

    function createRanking(sortedPairs) {
        const result = [];

        let tmp = -1;
        for (let i = 0; i < sortedPairs.length; i++) {
            const elem = sortedPairs[i];

            if (elem[1] === tmp) {
                result[result.length - 1].push(elem[0]);
            } else {
                result.push([elem[0]]);
                tmp = elem[1];
            }
        }
        return result;
    }
};

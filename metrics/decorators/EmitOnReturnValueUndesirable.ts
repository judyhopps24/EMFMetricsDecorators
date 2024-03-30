import Logger from '../../utils/Logger';
import { MetricUnits } from '../MetricUnits';
import { MetricMetadataInterface } from '../MetricMetadataInterface';
import { MetricTypes } from '../MetricTypes';
import { MatchValueProps } from '../MatchValueProps';
import _ from 'lodash';
import { COLON, EMPTY_STRING } from '../../common/Constants';
import { getIncludedArgValuesPrefix } from './IncludeInMetrics';

const recordIfIncorrectMatch = (operationName: string, serviceName: string, resultValue: any,
    matchValue: MatchValueProps) => {

    const expectedValue = matchValue.idealValue;
    const propertyName = matchValue.propertyName;
    const resultPropertyValue = !propertyName ? resultValue: resultValue[propertyName];

    if(!_.isEqual(resultPropertyValue, expectedValue)) {
        // If the propertyValue is of primitive type, only then add it to the metric name
        // If its arrays, objects, custom objects, functions, errors. Dont add.
        const resultPropertyValueSuffix = (resultPropertyValue instanceof Object)?
            EMPTY_STRING : COLON + resultPropertyValue;

        const metricMetadata: MetricMetadataInterface = {
            serviceName: serviceName,
            // ex: readMediaFeedsReturnValueUndesirable:false
            metricName: operationName + MetricTypes.RETURN_VALUE_UNDESIRABLE + resultPropertyValueSuffix,
            metricUnit: MetricUnits.COUNT,
            metricValue: 1,
        };
        Logger.verbose(metricMetadata);
    }
};

/**
 * Checks result of function's execution and emits into cloudwatch metric if the
 * result does not match to expected value.
 * Applicable for both async/synchronous functions.
 * @param matchValueProps the value that the wrapped function should ideally return
 * and the property it should return the value in.
 */
export default <T>(matchValueProps: MatchValueProps) => {
    return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const serviceName = this.constructor.name;
            const operationName = propertyKey;

            // gets the param values annotated with @IncludeInMetrics to add them as prefix to metric name.
            // only primitive values will be prefixed.
            const argPrefix = getIncludedArgValuesPrefix(target, propertyKey, args);

            const result = originalMethod.apply(this, args);
            if (result instanceof Promise) {
                return result.then((value) => {
                    recordIfIncorrectMatch(argPrefix + operationName, serviceName , value, matchValueProps);
                    return value;
                }).catch((error) => {
                    throw error;
                });
            } else {
                recordIfIncorrectMatch(argPrefix + operationName, serviceName, result, matchValueProps);
                return result;
            }
        };
        return descriptor;
    };
};

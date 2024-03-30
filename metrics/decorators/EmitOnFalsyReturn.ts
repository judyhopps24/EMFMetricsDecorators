import Logger from '../../utils/Logger';
import { MetricUnits } from '../MetricUnits';
import { MetricMetadataInterface } from '../MetricMetadataInterface';
import { MetricTypes } from '../MetricTypes';

const recordIfReturnValueFalsy = (operationName: string, serviceName: string, resultValue: any) => {
    if(!Boolean(resultValue)) {
        const metricMetadata: MetricMetadataInterface = {
            serviceName: serviceName,
            // ex: readMediaFeedsReturnValueNull
            metricName: operationName + MetricTypes.RETURN_VALUE_FALSY,
            metricUnit: MetricUnits.COUNT,
            metricValue: 1,
        };
        Logger.verbose(metricMetadata);
    }
};

/**
 * Emits metric if the method returns falsy values like null, 0, undefined.
 * https://www.freecodecamp.org/news/what-are-falsey-values-in-javascript/#how-to-check-if-a-value-is-falsy-in-javascript
 * Applicable for both sync/asynchronous functions.
 */
export default <T>() => {
    return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const serviceName = this.constructor.name;
            const result: Promise<T> | T = originalMethod.apply(this, args);
            if (result instanceof Promise) {
                return result.then((value) => {
                    recordIfReturnValueFalsy(propertyKey, serviceName, value);
                    return value;
                }).catch((error) => {
                    throw error;
                });
            } else {
                recordIfReturnValueFalsy(propertyKey, serviceName, result);
                return result;
            }
        };
        return descriptor;
    };
};

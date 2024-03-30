import Logger from '../../utils/Logger';
import { MetricUnits } from '../MetricUnits';
import { MetricMetadataInterface } from '../MetricMetadataInterface';
import { MetricTypes } from '../MetricTypes';
import { COLON, COMMAND_SEND_ERROR } from '../../common/Constants';
import { getIncludedArgValuesPrefix } from './IncludeInMetrics';

export const recordError = (operationName: string, exceptionName: string, serviceName: string) => {
    const metricMetadata: MetricMetadataInterface = {
        serviceName: serviceName,
        // ex: readMediaFeeds:ReadJsonObjectFailedErrorCount
        metricName: operationName + COLON + exceptionName + MetricTypes.COUNT,
        metricUnit: MetricUnits.COUNT,
        metricValue: 1,
    };
    Logger.verbose(metricMetadata);
};

/**
 * Captures the count of the different errors thrown by the function.
 * Applicable for both async/synchronous functions.
 */
export default function EmitOnError() {
    return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const serviceName = this.constructor.name;
            const operationName = propertyKey;

            // gets the param values annotated with @IncludeInMetrics to add them as prefix to metric name.
            // only primitive values will be prefixed.
            const argPrefix = getIncludedArgValuesPrefix(target, propertyKey, args);

            let result;
            try {
                result = originalMethod.apply(this, args);
            } catch (err) {
                // Will reach here if function is synchronous and throws error.
                // Although error.constructor.name would never be undefined, had to do this due lint issues.
                const exceptionName: string = (err as any).constructor.name || COMMAND_SEND_ERROR;
                recordError(argPrefix + operationName, exceptionName, serviceName);
                throw err;
            }

            if(result instanceof Promise) {
                return result.then((value) => {
                    // will reach here if function is asynchronous and does not throw error.
                    return value;
                }).catch((error) => {
                    // will reach here if function is asynchronous and throws error.
                    const exceptionName: string = (error).constructor.name || COMMAND_SEND_ERROR;
                    recordError(argPrefix + operationName, exceptionName, serviceName);
                    throw error;
                });
            }
            // will reach here if function is synchronous and does not throw error.
            return result;
        };
        return descriptor;
    };
};



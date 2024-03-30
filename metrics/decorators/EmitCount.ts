import Logger from '../../utils/Logger';
import { MetricUnits } from '../MetricUnits';
import { MetricMetadataInterface } from '../MetricMetadataInterface';
import { MetricTypes } from '../MetricTypes';

const recordCount = (operationName: string, serviceName: string) => {
    const metricMetadata: MetricMetadataInterface = {
        serviceName: serviceName,
        metricName: operationName + MetricTypes.COUNT, // ex: createClusterCount
        metricUnit: MetricUnits.COUNT,
        metricValue: 1,
    };
    Logger.verbose(metricMetadata);
};

/**
 * Captures the number of times the method was called.
 * Applicable for both async/synchronous functions.
 */
export default function EmitCount() {
    return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const serviceName = this.constructor.name;
            recordCount(propertyKey, serviceName);
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
};

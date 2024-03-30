import Logger from '../../utils/Logger';
import { MetricUnits } from '../MetricUnits';
import { MetricMetadataInterface } from '../MetricMetadataInterface';
import { MetricTypes } from '../MetricTypes';

const recordTime = (operationName: string, startTime, serviceName: string) => {
    const latencyMillis = new Date().getTime() - startTime;
    const metricMetadata: MetricMetadataInterface = {
        serviceName: serviceName,
        metricName: operationName + MetricTypes.LATENCY, // ex: createClusterLatency
        metricUnit: MetricUnits.MILLI_SECS,
        metricValue: latencyMillis,
    };
    Logger.verbose(metricMetadata);
};

/**
 * Captures the elapsed time of an asynchronous function's execution.
 * Applicable for only asynchronous functions.
 */
export default function EmitLatency () {
    return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const serviceName = this.constructor.name;
            const operationName = propertyKey;
            const start = new Date().getTime();
            try {
                return await originalMethod.apply(this, args);
            } finally {
                recordTime(operationName, start, serviceName);
            }
        };
    };
};

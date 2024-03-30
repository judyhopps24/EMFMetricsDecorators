import { MetricUnits } from './MetricUnits';

/**
 * Interface to hold metadata that would be required to emit logs in Embedded metric format.
 */
export interface MetricMetadataInterface {
    /**
     * Name of the service/client that the metric is emitted for.
     * Example: MemoryDBClient, Orchestrator, IdentifierSetClient.
     */
    serviceName: string,
    /**
     * Name of the metric emitted.
     * Example: createClusterLatency, connectToRedisCount
     */
    metricName: string,
    /**
     * Units of the metric's value.
     * Example: secs, count, milli secs.
     */
    metricUnit: MetricUnits,
    /**
     * Value of the metric
     * Example: 900, 1
     */
    metricValue: number,
}

import {
    LATENCY_METRIC_TYPE,
    COUNT_METRIC_TYPE,
    RETURN_VALUE_UNDESIRABLE_METRIC_TYPE,
    RETURN_VALUE_FALSY_METRIC_TYPE } from '../common/Constants';

/**
 * Enum to map the field type to the field type prefix.
 */
export enum MetricTypes {
    LATENCY = LATENCY_METRIC_TYPE,
    COUNT = COUNT_METRIC_TYPE,
    RETURN_VALUE_UNDESIRABLE = RETURN_VALUE_UNDESIRABLE_METRIC_TYPE,
    RETURN_VALUE_FALSY = RETURN_VALUE_FALSY_METRIC_TYPE,
}
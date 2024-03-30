import { TransformFunction, TransformableInfo } from 'logform';
import { createLogger, format, transports } from 'winston';
import { MetricMetadataInterface } from '../metrics/MetricMetadataInterface';
import { SERVICE_NAME_DIMENSION, VERBOSE_LOGGING_LEVEL } from '../common/Constants';

/**
 * If the log is of level "verbose", adds the _aws property to it making it of the
 * EMF format that emits metrics.
 * Using the EMF format: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format_Specification.html
 * @param info
 */
const transformToMetricLog: TransformFunction = (info: TransformableInfo) => {
    const { level, message } = info;
    if(level != VERBOSE_LOGGING_LEVEL)
        return info;
    const metricMetadata = message as MetricMetadataInterface;
    // eslint-disable-next-line no-underscore-dangle
    info._aws = {
        CloudWatchMetrics: [
            {
                Dimensions: [[SERVICE_NAME_DIMENSION]],
                Metrics: [
                    {
                        Name: metricMetadata.metricName,
                        Unit: metricMetadata.metricUnit
                    }
                ],
                Namespace: "Application"
            }
        ],
        Timestamp: Date.now(),
    };
    info[metricMetadata.metricName] = metricMetadata.metricValue;
    info[SERVICE_NAME_DIMENSION] = metricMetadata.serviceName;

    // Removing unwanted message property while logging logs of EMF format.
    // Since all the information in the message property is already present in _aws property.
    delete info.message;
    return info;
};

const Logger = createLogger({
    // making the lowest level log to be verbose instead of default 'info'.
    // Since all the metrics logs use the 'verbose' level.
    level: VERBOSE_LOGGING_LEVEL,
    format: format.combine(
        format(transformToMetricLog)(),
        format.json()
    ),
    transports: [
        new transports.Console()
    ]
});

export default Logger;

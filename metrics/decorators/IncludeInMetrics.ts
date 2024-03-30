import 'reflect-metadata';
import { COLON, EMPTY_STRING } from '../../common/Constants';

export const includeMetadataKey = Symbol('IncludeInMetrics');

/**
 * Parameter decorator that adds the decorated parameter's value as prefix to metric names.
 * @param target class
 * @param propertyKey name of the function
 * @param parameterIndex index of the parameter decorated
 */
export default function(target: object, propertyKey: string, parameterIndex: number) {
    const existingIncludedParameters: number[] = Reflect.getOwnMetadata(includeMetadataKey, target, propertyKey) || [];
    existingIncludedParameters.push(parameterIndex);
    Reflect.defineMetadata( includeMetadataKey, existingIncludedParameters, target, propertyKey);
}

/**
 * Returns the prefix for the metric name.
 * Can use this is on any metric decorator.
 */
export const getIncludedArgValuesPrefix = (target: object, propertyKey: string, args: any[]) => {
    const includeParamsIndexes: number[] = Reflect.getOwnMetadata(includeMetadataKey, target, propertyKey);
    if (!includeParamsIndexes) {
        return EMPTY_STRING;
    }
    return includeParamsIndexes
        .filter((index) => {return index < args.length;})
        .map((index) => {return args[index];})
        .filter((value) => {return value !== undefined;})
        .map((value) => {return value instanceof Object ? EMPTY_STRING : `${value}${COLON}`;})
        .reduce((acc, prefix) => {return acc + prefix;}, EMPTY_STRING);
};

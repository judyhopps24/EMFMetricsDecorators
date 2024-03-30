/**
 * Interface for holding props for matching the result of a method to expected ideal values.
 * For functions returning objects, we specify the propertyName and the property's ideal value.
 * For functions returning primitives, we only specify the ideal value.
 */
export interface MatchValueProps {
    /**
     * The name of the returned object's property whose value needs to be checked.
     */
    propertyName?: string,
    /**
     * The value the property in the returned object.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    idealValue: any
}

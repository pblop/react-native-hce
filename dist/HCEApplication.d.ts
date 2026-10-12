/**
 * This interface is intended to describe the "card application" state that
 * can be represented in Host card emulation. Intended to be immutable.
 */
export interface HCEApplication {
    /**
     * Internal unique identifier of application type.
     */
    type: string;
    /**
     * The content of application that can vary during the lifetime, e.g. internal files.
     */
    content: any;
}

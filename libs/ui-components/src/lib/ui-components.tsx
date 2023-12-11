import styles from './ui-components.module.css';

/* eslint-disable-next-line */
export interface UiComponentsProps {}

export function UiComponents(props: UiComponentsProps) {
    return (
        <div className={styles['container']}>
            <h1>Welcome to UiComponents!</h1>
        </div>
    );
}

export default UiComponents;


import { ReactNode } from 'react';
import styles from './EmptyData.module.scss';

export const EmptyData = ({data} : {data: string | ReactNode}) => {
    return <div className={styles.empty}>
        {data}
    </div>
}
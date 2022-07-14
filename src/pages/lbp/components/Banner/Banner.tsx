
import { Heading1 } from '@app/ui/typography'
import React from 'react';
import styles from './banner.module.scss';

export const Banner = () => {
    return (
        <div>
            <Heading1 className={styles.title}>Liquidity Bootstrapping Pools </Heading1>
            <div className={styles.banner}>
                <div className={styles.listInfo}>Curated Token Launch Auctions List</div>
                <div className={styles.info}>
                    Curated lists allow 3rd parties to curate auctions into lists according to their own standards.
                    Bounce doesn't have any say over the parameters which a 3rd party uses to qualify a project for curation,
                    but to supplement this filtering we still strongly encourage users to continue to do their own researchand to
                    understand the conditions that each curator undertakes to select the auctions for their list.
                </div>
            </div>
            
        </div>
    )
}

import React from 'react';
import Header from '../../common/Header'
import Footer from '../../common/Footer'
import BodySuccessView from './BodySuccessView'
import styles from '../../styles.module.css'

const SuccessView: React.FC<{ txType: "instant" | "pending" }> = ({ txType }) => {

  return (
    <div className={styles.view}>
      <Header title={txType === 'instant' ? "Purchase completed" : "Purchase registred"} backButton={txType !== 'instant'} />
      <BodySuccessView txType={txType} />
      <Footer />
    </div>
  );
};

export default SuccessView;
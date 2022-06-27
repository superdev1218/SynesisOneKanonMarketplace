import React, { useEffect, useMemo, useState } from 'react';
import { Link, Box, Typography, Button, useMediaQuery } from '@mui/material';
import KanonColorButton from '../../Common/KanonColorButton';
import { useNavigate } from 'react-router-dom';
import { RightArrow } from '../../Common/Arrow';
import * as Sentry from '@sentry/react';
import LandingVideo from '../../../assets/Landing2/KanonLanding.mp4';
import LandingBackground from '../../../assets/Landing2/KanonLanding.png';
import { useSelector, useDispatch } from 'react-redux';

import * as anchor from '@project-serum/anchor';

import { Connection, PublicKey, clusterApiUrl, Keypair, Transaction, TransactionSignature } from '@solana/web3.js';
import ArcProgress from 'react-arc-progress';
import { useWallet } from '@solana/wallet-adapter-react';
import { Program, Provider, BN, web3 } from '@project-serum/anchor';
import { WalletModalButton } from '@solana/wallet-adapter-react-ui';
import { setLoading } from '../../../redux/ducks/main';
import { EstTime, UpdateMetadataDuration } from '../../../utils/helper';
import { programs } from '@metaplex/js';
import { KanonProgramAdapter } from 'kanon-marketplace-sdk';

const { REACT_APP_PUBLIC_NETWORK, REACT_APP_ENDPOINT } = process.env;
const opts = {
  preflightCommitment: 'processed'
};
const connection = new Connection(REACT_APP_ENDPOINT, opts.preflightCommitment);

let interval;
let totalIndex = 0;

const HomeSection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoading = useSelector((state) => state.main.loading);

  const isXsMin = useMediaQuery('(min-width:900px)');
  const isXs = useMediaQuery('(min-width:600px)');
  const [stepTxt, setStepTxt] = useState('');
  const [step, setStep] = useState(-1); // 0 is preparing, 1 is countdown, 2 is premint, 3 is blocking, 4 is FREELYMINT, 5 is published
  const [duration, setDuration] = useState(0);
  const [contDown, setCountDown] = useState(0);
  const [premint, setPremint] = useState(0);
  const [blocking, setBlocking] = useState(0);
  const [freelyMint, setFreelyMint] = useState(0);

  const [collectiontxt, setCollectionTxt] = useState('AQUARIUS COLLECTION COMING SOON!');
  const [detailtxt, setDetailTxt] = useState('');
  const [moredetailtxt, setMoreDetailTxt] = useState('');

  const wallet = useSelector((state) => state.main.wallet);
  const provider = useSelector((state) => state.main.provider);
  const proof = useSelector((state) => state.main.proof);
  const KNProgram = useSelector((state) => state.main.KNProgram);

  const [userWallet, setUserWallet] = useState(null);
  const [showmint, setShowMint] = useState(false);

  const getProvider = async () => {
    try {
      const collectionState = await KNProgram.getProgram().account.collectionAccount.fetch(
        KNProgram._collection_state_account_pubkey
      );
      if (collectionState.seasonOpenedTimestamp.toNumber() == 0) {
        setStep(0);
        setStepTxt('');
        setCollectionTxt('AQUARIUS COLLECTION COMING SOON!');
        setDetailTxt('');
        return;
      }
      setCountDown(collectionState.countdownDuration.toNumber());
      setPremint(collectionState.premintDuration.toNumber());
      setBlocking(collectionState.premintBlockingDuration.toNumber());
      setFreelyMint(collectionState.mintWave3Duration.toNumber());
      setDuration(collectionState.seasonOpenedTimestamp.toNumber());

      // console.log(collectionState.countdownDuration.toNumber());
      // console.log(collectionState.premintDuration.toNumber());
      // console.log(collectionState.premintBlockingDuration.toNumber());
      // console.log(collectionState.mintWave3Duration.toNumber());
      // console.log(collectionState.seasonOpenedTimestamp.toNumber());
      // let current_timestamp = Math.floor(Date.now() / 1000);
      // console.log((current_timestamp - collectionState.seasonOpenedTimestamp.toNumber()) / 3600);
    } catch (err) {
      Sentry.captureException(err);
    }
  };
  useEffect(async () => {
    dispatch(setLoading(true));
    if (wallet && wallet.connected && !wallet.disconnecting && provider != null) {
      setUserWallet(wallet);
      getProvider();
    } else {
      setStepTxt('');
      try {
        let wallets = { ...wallet };
        const random = anchor.web3.Keypair.generate();
        wallets.publicKey = random.publicKey;
        setUserWallet(wallets);
        const prov = new Provider(connection, wallets, {
          preflightCommitment: 'confirmed'
        });
        const programs = new KanonProgramAdapter(prov, {
          isDevNet: REACT_APP_PUBLIC_NETWORK == 'devnet'
        });
        await programs.refreshByWallet();
        const collectionState = await programs
          .getProgram()
          .account.collectionAccount.fetch(programs._collection_state_account_pubkey);
        if (collectionState.seasonOpenedTimestamp.toNumber() == 0) {
          setStep(0);
          setStepTxt('');
          setCollectionTxt('AQUARIUS COLLECTION COMING SOON!');
          setDetailTxt('');
          return;
        }
        setCountDown(collectionState.countdownDuration.toNumber());
        setPremint(collectionState.premintDuration.toNumber());
        setBlocking(collectionState.premintBlockingDuration.toNumber());
        setFreelyMint(collectionState.mintWave3Duration.toNumber());
        setDuration(collectionState.seasonOpenedTimestamp.toNumber());
      } catch (err) {
        Sentry.captureException(err);
      }
    }
    dispatch(setLoading(false));
  }, [wallet, provider]);

  const [timeLeft, setTimeLeft] = React.useState(['0', '0', '0', '0']);
  const [percentage, setPercentage] = React.useState([0, 0, 0, 0]);
  const titles = ['DAYS', 'HRS', 'MINS', 'SECS'];

  const BelowButton = () => {
    if (step === 1) {
      if (showmint) {
        return (
          <Button variant="contained" className="btn-watch-now" onClick={() => navigate('/mint')}>
            Minting page
          </Button>
        );
      }
    }
    if (step === 2) {
      return (
        <Button variant="contained" className="btn-watch-now" onClick={() => navigate('/mint')}>
          Minting page
        </Button>
      );
    }
    if (step === 3) {
      return (
        <Button variant="contained" className="btn-watch-now" onClick={() => navigate('/mint')}>
          Minting page
        </Button>
      );
    }
    if (step === 4) {
      return (
        <Button variant="contained" className="btn-watch-now-inactive" disabled={true}>
          Marketplace
        </Button>
      );
    }
    if (step === 5) {
      return (
        <Button variant="contained" className="btn-watch-now" disabled={false} onClick={() => navigate('/marketplace')}>
          Marketplace
        </Button>
      );
    }
    return (
      <Button variant="contained" className="btn-watch-now1">
        <Link href="https://youtu.be/82QgHhQlBDg" target="_blank" rel="noreferrer">
          Watch Video
        </Link>
      </Button>
    );
  };

  useEffect(() => {
    function setProgress(dif, duration, txt) {
      totalIndex++;
      let timeLefts = [0, 0, 0, 0];
      let percentages = [0, 0, 0, 0];
      setTimeLeft([...timeLefts]);
      setPercentage([...percentages]);
      timeLefts = [
        parseInt(dif / (60 * 60 * 24)),
        parseInt((dif / (60 * 60)) % 24),
        parseInt((dif / 60) % 60),
        parseInt(dif % 60)
      ];
      percentages = [
        timeLefts[0] == 0 && totalIndex % 2 == 1 ? 0.001 : (timeLefts[0] / duration) * 24,
        timeLefts[1] == 0 && totalIndex % 2 == 1 ? 0.001 : timeLefts[1] / 24,
        timeLefts[2] == 0 && totalIndex % 2 == 1 ? 0.001 : timeLefts[2] / 60,
        timeLefts[3] == 0 && totalIndex % 2 == 1 ? 0.001 : timeLefts[3] / 60
      ];
      setStepTxt(txt);
      setTimeLeft([...timeLefts]);
      setPercentage([...percentages]);
    }
    interval = setInterval(() => {
      if (duration != 0) {
        let current_timestamp = Math.floor(Date.now() / 1000);
        let difference = (current_timestamp - duration) / 3600;
        difference -= contDown;
        if (difference <= 0) {
          let dif = duration + contDown * 3600 - current_timestamp;
          setStep(1);
          setCollectionTxt('AQUARIUS COLLECTION COMING SOON!');
          setDetailTxt('');
          if (dif / 3600 <= 12) {
            setShowMint(true);
          }
          setProgress(dif, contDown, 'CountDown to whitelist sale');
          return;
        }
        difference -= premint + blocking;
        if (difference <= 0) {
          let dif = duration + (premint + contDown + blocking) * 3600 - current_timestamp;
          setStep(2);
          setCollectionTxt('Aquarius Collection:');
          setDetailTxt('Whitelist sale is now live!');
          setProgress(dif, premint + blocking, 'CountDown to public sale');
          return;
        }
        if (step === 5) {
          return (
            <Button variant="contained" className="btn-watch-now" disabled={true} onClick={() => navigate('/')}>
              Marketplace
            </Button>
          );
        }
        difference -= UpdateMetadataDuration;
        let txt = EstTime(duration + (premint + contDown + blocking + freelyMint + UpdateMetadataDuration) * 3600);
        if (difference <= 0) {
          let dif =
            duration + (premint + contDown + blocking + freelyMint + UpdateMetadataDuration) * 3600 - current_timestamp;
          setStep(4);
          setCollectionTxt('Aquarius Collection:');
          setDetailTxt('Minting has completed');
          // setMoreDetailTxt("Marketplace opening " + txt)
          setMoreDetailTxt('Marketplace opening Mar 11 9am PST');
          setProgress(dif, blocking, '');
          return;
        }
        setCollectionTxt('Aquarius Collection');
        setDetailTxt('');
        setStep(5);
        setProgress(0, 1, '');
        clearInterval(interval);
        return;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <Box className="mp-landing-home-section">
      <Link id="home" href="#" />
      {isXs && (
        <video autoPlay loop muted className="mp-landing-home-section-video">
          <source type="video/mp4" src={LandingVideo} />
        </video>
      )}
      {step !== -1 && (
        <Box className="mp-landing-home-section-content">
          <Box className="mp-landing-home-section-content-title">
            <Typography className="text1">Own A Word</Typography>
            <Typography className="text2">{collectiontxt}</Typography>
            <Typography className="text3">{detailtxt}</Typography>
            {step == 4 && (
              <Box className="below-buttons">
                <Typography className="text3">{moredetailtxt}</Typography>
              </Box>
            )}
            <Box className="below-buttons">
              <BelowButton />
            </Box>
            <Typography className="countdown-text">{stepTxt}</Typography>
          </Box>
          {step != 5 && step != 4 && step != 3 && step != 0 && (
            <Box className="mp-landing-home-section-content-cards-list">
              {titles.map((val, index) => (
                // <Box className={classes.card} key={index} >
                //     <ArcProgress
                //         size={120}
                //         animation={false}
                //         arcStart={-90}
                //         arcEnd={270}
                //         progress={percentage[index]}
                //         thickness={3}
                //         emptyColor='#3d2a69'
                //         fillColor='#fff'
                //         text={timeLeft[index].toString()}
                //         textStyle={{ size: '42px', color: '#FFF', font: "Klavika", y: 45 }}
                //         customText={[{ text: val, size: '17', color: 'rgba(224,224,255,.6)', font: "Klavika", y: 80, x: 60 }]}
                //     />
                // </Box>
                <Box className="mp-landing-home-section-content-cards-list-card" key={index}>
                  <ArcProgress
                    size={isXsMin ? 120 : isXs ? 100 : 70}
                    animation={false}
                    arcStart={-90}
                    arcEnd={270}
                    progress={percentage[index]}
                    thickness={3}
                    emptyColor="#3d2a69"
                    fillColor="#fff"
                    text={timeLeft[index].toString()}
                    textStyle={{
                      size: isXsMin ? '42px' : isXs ? '36px' : '28px',
                      color: '#FFF',
                      font: 'Klavika',
                      y: isXsMin ? 45 : isXs ? 40 : 35
                    }}
                    customText={[
                      {
                        text: val,
                        size: isXs ? '17px' : '15px',
                        color: '#FFF',
                        font: 'Klavika',
                        y: isXsMin ? 80 : isXs ? 75 : 100,
                        x: isXsMin ? 60 : isXs ? 50 : 35
                      }
                    ]}
                  />
                </Box>
              ))}
            </Box>
          )}
          {!isXs && step != 5 && step != 4 && step != 3 && step != 0 && (
            <Box className="timelines">
              <Box className="timeline-date">Days</Box>
              <Box className="timeline-date">HRS</Box>
              <Box className="timeline-date">MINS</Box>
              <Box className="timeline-date">SECS</Box>
            </Box>
          )}
          {/* <Box className={classes.btnLayer}>
             <WalletModalButton className={classes.exploreButton}>
                  Connect&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<RightArrow />
              </WalletModalButton>
              {step == 0 && <WalletModalButton className={classes.exploreButton}>
                  Connect&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<RightArrow />
              </WalletModalButton>}
          </Box> */}
        </Box>
      )}
    </Box>
  );
};

export default HomeSection;


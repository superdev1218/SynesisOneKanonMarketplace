import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles, withStyles } from '@mui/styles';
import {
  Button,
  Box,
  Typography,
  Grid,
  Dialog,
  DialogContent,
  IconButton,
  useMediaQuery,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import * as Sentry from '@sentry/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import { useWallet } from '@solana/wallet-adapter-react';
import { Program, Provider, BN, web3 } from '@project-serum/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Metadata, MetadataProgram } from '@metaplex-foundation/mpl-token-metadata';
import KanonColorButton from '../../Common/KanonColorButton';
import { KanonProgramAdapter } from 'kanon-marketplace-sdk';
import axios from 'axios';
import { setLoading } from '../../../redux/ducks/main';
import { ToastContainer, toast } from 'react-toastify';
import {
  AirdropPgSize,
  CallTime,
  getreservednftsbywallet,
  getreservednftproofbymintaddressandwallet,
  getthumbnailbymintaddresses,
  EstTime
} from '../../../utils/helper';
import clsx from 'clsx';
import * as anchor from '@project-serum/anchor';
import 'react-toastify/dist/ReactToastify.css';
import { NO_MORE_NFT, OUT_OF_NFTSAMOUNT, ERROR_CONDITION, errorData, toastConfig } from '../../Common/StaticData';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import LoaderImage from '../../../assets/loader.png';
import { Connection, PublicKey } from '@solana/web3.js';
import DarafarmJson from '../../../contracts/Contract.json';
import { getParsedNftAccountsByOwner, isValidSolanaAddress, createConnectionConfig } from '@nfteyez/sol-rayz';
import { findAssociatedTokenAddress } from '../../../utils/helper';
import { AccountLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
const { createTokenAccount, sleep, token, getTokenAccount } = require('@project-serum/common');

const {
  REACT_APP_SERVER_URL,
  REACT_APP_PUBLIC_NETWORK,
  REACT_APP_ENDPOINT,
  REACT_APP_STAKE_NETWORK,
  REACT_APP_STAKE_PROGRAMID
} = process.env;
const opts = {
  preflightCommitment: 'processed'
};
const connection = new Connection(REACT_APP_STAKE_NETWORK, opts.preflightCommitment);

const useStyles = makeStyles((theme) => ({
  detailModal: {
    fontFamily: 'Klavika',
    width: '100%',
    zIndex: '10000 !important',
    '& .MuiPaper-root': {
      background: ` linear-gradient(
                135deg,
                rgba(245, 247, 250, 0.12) 0%,
                rgba(245, 247, 250, 0.06) 51.58%,
                rgba(245, 247, 250, 0.0001) 98.94%
            )`,
      border: '1px solid rgba(245, 247, 250, 0.06)',
      boxSizing: 'border-box',
      boxShadow: ` 0px 1px 1px rgba(20, 16, 41, 0.4), -4px -4px 8px rgba(224, 224, 255, 0.04),
                8px 8px 24px rgba(20, 16, 41, 0.4)`,
      backdropFilter: 'blur(108.731px)',
      borderRadius: 24,
      [theme.breakpoints.down('md')]: {
        display: 'block'
      },
      [theme.breakpoints.down('sm')]: {
        display: 'block',
        width: '100%',
        marginTop: '200px !important'
      }
    },
    '& .MuiPaper-root>:nth-Child(0)': {
      paddingTop: 40
    },
    '& .MuiTouchRipple-root': {
      width: '0px !important',
      height: '0px !important'
    }
  },
  tag: {
    display: 'flex',
    fontSize: '13px !important',
    fontFamily: 'Montserrat',
    height: 24,
    color: 'white',
    marginTop: '10px',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailModalContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowX: 'hidden',
    marginLeft: '40px',
    marginRight: '40px',
    width: '800px',
    padding: '50px',

    [theme.breakpoints.down('lg')]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginLeft: '30px',
      marginRight: '30px',
      width: 760
    },
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 520,
      marginLeft: '0px',
      marginRight: '0px'
    },
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginLeft: 0,
      marginRight: 0,
      width: '100%'
    },
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginLeft: '0px',
      marginRight: '0px'
    }
  },
  subModalContent: {
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      marginBottom: '100px',
      marginTop: '50px'
    }
  },
  closeButtonDiv: {
    display: 'flex',
    justifyContent: 'flex-end',
    height: '50px',
    width: '100%',
    paddingTop: '10px',
    paddingRight: '25px',
    position: 'absolute',
    zIndex: 1000,
    [theme.breakpoints.down('sm')]: {
      // position: 'fixed',
      zIndex: 1000
    }
  },
  closeButton: {
    '& .MuiSvgIcon-root': {
      color: 'rgba(224, 224, 255, 0.24)'
    },
    height: '40px !important'
  },
  itemContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      alignItems: 'flex-start'
    },
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'center',
      width: '80%'
    }
  },
  content: {
    paddingLeft: 40,
    paddingTop: 20,
    width: '350px',
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '6px',
      height: '6px'
    },

    '&::-webkit-scrollbar-track': {
      background: '#e4e2e2',
      borderRadius: '10px'
    },

    '&::-webkit-scrollbar-thumb': {
      borderRadius: '10px',
      background: 'rgb(148, 147, 147)'
    },

    '&::-webkit-scrollbar-thumb:hover': {
      background: 'rgb(119, 118, 118)'
    },
    [theme.breakpoints.down('md')]: {
      width: '300px !important',
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0
    }
  },
  title: {
    fontSize: '24px !important',
    marginTop: '20px !important',
    marginBottom: '20px !important',
    color: 'white',
    fontWeight: 'bold !important'
  },
  progressSection: {
    display: 'flex !important',
    width: '750px !important',
    justifyContent: 'center !important',
    alignItems: 'center !important'
  },
  smallTitle: {
    fontWeight: '500',
    fontSize: '13px',
    lineHeight: '16px',
    color: 'rgba(255, 255, 255, 0.6);'
  },
  mainTitle: {
    fontSize: '24px',
    lineHeight: '32px',
    color: '#FFFFFF',
    [theme.breakpoints.down('md')]: {
      fontSize: '16px !important'
    }
  },
  stakeFrom: {
    padding: '24px',
    background: 'rgba(224, 224, 255, 0.02)',
    borderRadius: '12px'
  },
  smallStakeFrom: {
    height: '96px',
    paddingLeft: '24px',
    paddingTop: '24px',
    background: 'rgba(224, 224, 255, 0.02)',
    borderRadius: '12px'
  },
  btnEnable: {
    display: 'flex',
    height: '48px',
    cursor: 'pointer',
    borderRadius: '12px !important',
    color: 'white !important',
    background: 'linear-gradient(135deg, #2D61E5 0%, #8A62F6 53.09%, #E3477E 100%)',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnNone: {
    display: 'none'
  },
  btnDisable: {
    display: 'flex',
    height: '48px',
    cursor: 'pointer',
    borderRadius: '12px !important',
    color: 'white !important',
    background: 'rgba(224, 224, 255, 0.02) !important',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lblUnstake: {
    textAlign: 'center',
    marginTop: '10px',
    display: 'flex',
    height: '48px',
    color: 'white',
    background: 'green'
  }
}));

let interval;

const AddStakeModal = ({ open, onClose, program, warn, mintAddress, success, stakeProvider }) => {
  const [current, setCurrent] = useState(0);
  const isXs = useMediaQuery('(min-width:600px)');
  const { sendTransaction } = useWallet();
  const provider = useSelector((state) => state.main.provider);
  const wallet = useSelector((state) => state.main.wallet);
  const loading = useSelector((state) => state.main.loading);
  const [nfttokens, setNftTokens] = useState([]);
  const dispatch = useDispatch();
  const [nfts, setNfts] = useState([]);
  const [poolNftStaked, setPoolNftStaked] = useState(false);
  const [stakeDate, setStakeDate] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [openDate, setOpenDate] = useState('');
  const TokenInstructions = require('@project-serum/serum').TokenInstructions;
  const [reward, setReward] = useState(0);
  const [enable, setEnable] = useState(false);

  const classes = useStyles();

  useEffect(async () => {
    if (open) {
      await showValues();
    }
  }, [open]);

  const showValues = async () => {
    dispatch(setLoading(true));
    if (program != null) {
      try {
        const [poolSetting, _a] = await anchor.web3.PublicKey.findProgramAddress(
          [Buffer.from(anchor.utils.bytes.utf8.encode('SNS:STATE'))],
          program.programId
        );

        const pool = await program.account.poolSetting.fetch(poolSetting);

        let nftTokenAccount = await findAssociatedTokenAddress(wallet.publicKey, new anchor.web3.PublicKey(mintAddress));
        const userTokenAccount = new anchor.web3.PublicKey(nftTokenAccount.toBase58());

        const [stakeAccount, bump] = await PublicKey.findProgramAddress(
          [
            userTokenAccount.toBuffer(),
            wallet.publicKey.toBuffer(),
            Buffer.from(anchor.utils.bytes.utf8.encode('SNS:STAKE'))
          ],
          program.programId
        );
        const stake = await program.account.stakeAccount.fetch(stakeAccount);
        let unlock = pool.nftUnlock.toNumber();
        let expire = pool.expirePool.toNumber();
        let numbers = pool.dyfLaunchTime.toNumber();
        let lockIn = stake.lockInTime.toNumber();
        let lastRewardClaim = stake.lastRewardClaim.toNumber();

        let current_timestamp = Math.floor(Date.now() / 1000);

        // let days = (current_timestamp - lastRewardClaim) / 86400;
        let days = current_timestamp - lastRewardClaim;

        // setEnable(!stake.rewarded)
        let reward = 0;
        if (pool.dyfLaunch) {
          if (lastRewardClaim < pool.nftCliff.toNumber()) {
            let launchdays = pool.dyfLaunchTime.toNumber() - lastRewardClaim;
            reward = launchdays * pool.nftSecReward.toNumber();
            if (reward < 0) {
              reward = 0;
            }
          }
        } else {
          reward = days * pool.nftSecReward.toNumber();
        }

        if (pool.nftUnlock.toNumber() < current_timestamp && !stake.rewarded && pool.dyfLaunch && stake.dyfUser) {
          reward = reward + pool.nftBonusReward.toNumber();
        }
        // if (stake.rewarded) {
        //     setEnable(false);
        // } else {
        //     setEnable(reward >= (pool.nftSecReward.toNumber() * 86400));
        // }
        setEnable(true);
        setReward((reward / anchor.web3.LAMPORTS_PER_SOL).toFixed(3).replace(/\.0+$/, ''));
        setStakeDate(EstTime(lockIn));
        setUnlockDate(EstTime(unlock));
        setOpenDate(EstTime(numbers));
        dispatch(setLoading(false));
      } catch (err) {
        dispatch(setLoading(false));
        warn(1, err);
        Sentry.captureException(err);
      }
    }
  };

  const claimNftReward = async (event) => {
    const tokenAccounts = await connection.getTokenAccountsByOwner(wallet.publicKey, {
      programId: TOKEN_PROGRAM_ID
    });
    tokenAccounts.value.forEach((e) => {
      const accountInfo = AccountLayout.decode(e.account.data);
    });
    dispatch(setLoading(true));
    try {
      const [pda, bump_sns] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode('SNS'))],
        program.programId
      );
      const [poolSetting, _a] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode('SNS:STATE'))],
        program.programId
      );

      let nftTokenAccount = await findAssociatedTokenAddress(wallet.publicKey, new anchor.web3.PublicKey(mintAddress));
      const userTokenAccount = new anchor.web3.PublicKey(nftTokenAccount.toBase58());

      const pool = await program.account.poolSetting.fetch(poolSetting);

      const tokenAccounts = await connection.getTokenAccountsByOwner(wallet.publicKey, {
        programId: TOKEN_PROGRAM_ID
      });
      let amountMax = 0;
      let maxAccount = null;
      let lastAccount = null;
      await tokenAccounts.value.forEach((e) => {
        const accountInfo = AccountLayout.decode(e.account.data);
        if (pool.mint.toBase58() == new PublicKey(accountInfo.mint).toBase58()) {
          var length = accountInfo.amount.length;

          let buffer = Buffer.from(accountInfo.amount);
          var result = buffer.readUIntBE(0, length);
          if (amountMax < result) {
            amountMax = result;
            maxAccount = e.pubkey;
          }
          lastAccount = e.pubkey;
        }
      });
      let userSnsAccount = maxAccount !== null ? maxAccount : lastAccount;
      if (userSnsAccount == null) {
        userSnsAccount = await createTokenAccount(stakeProvider, pool.mint, wallet.publicKey);
      }

      const [stakeAccount, bump] = await PublicKey.findProgramAddress(
        [userTokenAccount.toBuffer(), wallet.publicKey.toBuffer(), Buffer.from(anchor.utils.bytes.utf8.encode('SNS:STAKE'))],
        program.programId
      );

      let stakes = await program.account.stakeAccount.fetch(stakeAccount);

      const metas = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

      const tokenAddress = new anchor.web3.PublicKey(mintAddress);
      let pdaToken = stakes.token;
      let [tokenMetadata, _bs] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('metadata'), metas.toBuffer(), tokenAddress.toBuffer()],
        metas
      );

      await program.rpc.poolNftClaimReward({
        accounts: {
          stakeAccount,
          authority: wallet.publicKey,
          userTokenAccount: userSnsAccount,
          nftTokenAccount,
          tokenMetadata,
          pdaTokenAccount: pdaToken,
          poolSetting,
          pda,
          poolVault: pool.vault,
          tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY
        }
      });

      dispatch(setLoading(false));
      showValues();
      warn(2, 'Successfully claimed reward');
    } catch (err) {
      dispatch(setLoading(false));
      Sentry.captureException(err);
      warn(1, err);
      onClose();
    }
  };
  /* create an account  */
  return (
    <Dialog
      className={classes.detailModal}
      open={open}
      onClose={() => {
        if (!loading) {
          setCurrent(0);
          setNfts([]);
          setNftTokens([]);
          onClose();
          clearInterval(interval);
        }
      }}
      fullScreen={!isXs}
      maxWidth={'100%'}
      aria-labelledby="responsive-dialog-title"
    >
      <Box className={classes.closeButtonDiv}>
        <IconButton onClick={onClose} aria-label="close" className={classes.closeButton}>
          <CloseIcon color={'white'} />
        </IconButton>
      </Box>
      <DialogContent className={classes.detailModalContent}>
        <Box className={classes.subModalContent}>
          <Box className={classes.title}>Stake details</Box>
          <Grid container>
            <Grid item xs={12} sm={12} lg={12}>
              <Box className={classes.stakeFrom}>
                <Box className={classes.smallTitle}>Staked from</Box>
                <Box className={classes.mainTitle}>Kanon NFT staking pool</Box>
              </Box>
            </Grid>
          </Grid>
          <Grid container justifyContent="start" alignItems="center" spacing={3} sx={{ marginTop: '0px' }}>
            <Grid item xs={12} sm={6} lg={6}>
              <Box className={classes.smallStakeFrom}>
                <Box className={classes.smallTitle}>Staked at</Box>
                <Box className={classes.mainTitle}>{stakeDate}</Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Box className={classes.smallStakeFrom}>
                <Box className={classes.smallTitle}>Data Yield Farming promotion start</Box>
                <Box className={classes.mainTitle}>{openDate}</Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Box className={classes.smallStakeFrom}>
                <Box className={classes.smallTitle}>Unlock opens</Box>
                <Box className={classes.mainTitle}>{unlockDate}</Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Box className={classes.smallStakeFrom}>
                <Box className={classes.smallTitle}>Available rewards</Box>
                <Box className={classes.mainTitle}>{reward}&nbsp;SNS</Box>
              </Box>
            </Grid>
          </Grid>
          <Grid container justifyContent="center" alignItems="center" spacing={4} sx={{ marginTop: '0px' }}>
            <Grid item xs={12} sm={6} lg={6}>
              <Button
                fullWidth
                disabled={!enable}
                className={enable ? classes.btnEnable : classes.btnDisable}
                onClick={enable ? claimNftReward : null}
              >
                Redeem rewards
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddStakeModal;


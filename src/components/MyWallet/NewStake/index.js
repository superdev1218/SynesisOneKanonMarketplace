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
import CircleIcon from '@mui/icons-material/Circle';
import { findAssociatedTokenAddress } from '../../../utils/helper';
import { Co2Sharp, LocalConvenienceStoreOutlined } from '@mui/icons-material';
import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';

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

const StakingType = {
  SNS: 1,
  NFT: 2,
  BOTH: 3
};

const useStyles = makeStyles((theme) => ({
  detailModal: {
    fontFamily: 'Klavika',
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
        marginTop: '200px !important',
        overflow: 'hidden'
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
    fontSize: '13px !important',
    fontFamily: 'Montserrat',
    height: 24,
    width: 'fit-content',
    display: 'flex',
    alignItems: 'center',
    color: 'white',
    paddingLeft: 8,
    paddingRight: 8,
    marginTop: '10px'
  },
  detailModalContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: '40px',
    marginRight: '40px',
    padding: '20px 40px !important',
    width: '800px',
    overflowX: 'hidden',
    overflowY: 'scroll',
    [theme.breakpoints.down('lg')]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginLeft: '30px',
      marginRight: '30px',
      width: 750
    },
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 500,
      marginLeft: '5px',
      marginRight: '5px'
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      display: 'flex',
      margin: 'auto',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      overflow: 'auto'
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
    [theme.breakpoints.down('sm')]: {
      marginTop: '50px',
      marginBottom: '100px'
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
  title: {
    fontSize: '24px !important',
    marginTop: '40px !important',
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
    fontSize: '20px',
    lineHeight: '24px',
    color: '#FFFFFF',
    display: 'flex',
    [theme.breakpoints.down('lg')]: {
      fontSize: '20px !important'
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '18px !important'
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '16px !important'
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '12px !important'
    }
  },
  stakeFrom: {
    height: '96px',
    paddingLeft: '24px',
    paddingTop: '24px',
    background: 'rgba(224, 224, 255, 0.02)',
    borderRadius: '12px'
  },
  smallStakeFrom: {
    paddingLeft: '24px',
    paddingTop: '24px',
    paddingRight: '24px',
    paddingBottm: '40px',
    paddingLeft: '24px !important',
    background: 'rgba(224, 224, 255, 0.02)',
    borderRadius: '12px',
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
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0
    }
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
    justifyContent: 'center',
    fontSize: '24px'
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
    background: 'grey !important',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lblUnstake: {
    textAlign: 'center',
    marginTop: '10px',
    display: 'flex',
    height: '48px',
    color: 'white !important',
    background: 'green'
  },
  circle: {
    borderRadius: '50%',
    minWidth: '8px',
    height: '8px',
    background: 'white !important',
    marginRight: '5px',
    marginTop: '8px'
  }
}));

let interval;

const NewStakeModal = ({ open, onClose, program, warn, mintAddress, success }) => {
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
  const TokenInstructions = require('@project-serum/serum').TokenInstructions;
  const ProgramID = new PublicKey(REACT_APP_STAKE_PROGRAMID);
  const [poolOpen, setPoolOpen] = useState('');
  const [lockup, setLockup] = useState('');
  const [totalRewards, setTotalRewards] = useState(0);
  const [dailyAccrual, setDailyAccrual] = useState('');
  const [startDate, setStartDate] = useState('');
  const [stakeEnable, setStakeEnable] = useState(false);
  const [total, setTotal] = useState(0);
  const [dailysns, setDailySns] = useState(0);
  const [yieldsns, setYieldSNS] = useState(0);
  const [dyflaunchTime, setDyflaunchTime] = useState(0);

  const { Keypair } = web3;

  const Tag = ({ type }) => {
    return (
      <Box className={classes.tag} style={{ zIndex: 9 }}>
        {type}
      </Box>
    );
  };
  const classes = useStyles();

  const stakeNftToPool = async (index) => {
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
      const pool = await program.account.poolSetting.fetch(poolSetting);

      const metas = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
      let nftTokenAccount = await findAssociatedTokenAddress(wallet.publicKey, new anchor.web3.PublicKey(mintAddress));
      const userTokenAccount = new anchor.web3.PublicKey(nftTokenAccount.toBase58());
      const tokenAddress = new anchor.web3.PublicKey(mintAddress);

      const [stakeAccount, bump] = await PublicKey.findProgramAddress(
        [userTokenAccount.toBuffer(), wallet.publicKey.toBuffer(), Buffer.from(anchor.utils.bytes.utf8.encode('SNS:STAKE'))],
        program.programId
      );

      let [tokenMetadata, _bs] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('metadata'), metas.toBuffer(), tokenAddress.toBuffer()],
        metas
      );

      let stake;

      try {
        stake = await program.account.stakeAccount.fetch(stakeAccount);
        if (stake === null) {
          let userToken = await findAssociatedTokenAddress(wallet.publicKey, new PublicKey(mintAddress));

          await program.rpc.poolCreateStakeAccount(StakingType.NFT, {
            accounts: {
              stakeAccount,
              userToken,
              poolSetting,
              authority: wallet.publicKey,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              systemProgram: anchor.web3.SystemProgram.programId,
              tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID
            }
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        let userToken = await findAssociatedTokenAddress(wallet.publicKey, new PublicKey(mintAddress));

        await program.rpc.poolCreateStakeAccount(StakingType.NFT, {
          accounts: {
            stakeAccount,
            userToken,
            poolSetting,
            authority: wallet.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID
          }
        });
      }
      let pdaToken = await createTokenAccount(provider, tokenAddress, pda);
      await program.rpc.poolNftStake({
        accounts: {
          stakeAccount,
          authority: wallet.publicKey,
          userTokenAccount,
          tokenMetadata,
          poolSetting,
          pda,
          pdaToken,
          tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY
        }
      });
      stake = await program.account.stakeAccount.fetch(stakeAccount);
      if (stake.stakeType.sns === undefined && stake.stakeType.nft === undefined) {
        setPoolNftStaked(false);
      } else if (stake.stakeType.sns !== undefined) {
        setPoolNftStaked(false);
      } else if (stake.stakeType.nft !== undefined) {
        setPoolNftStaked(stake.status);
      } else {
        setPoolNftStaked(false);
      }
      if (stake.status == true) {
        const [poolSetting, _a] = await anchor.web3.PublicKey.findProgramAddress(
          [Buffer.from(anchor.utils.bytes.utf8.encode('SNS:STATE'))],
          program.programId
        );

        success();
        onClose();
      }

      dispatch(setLoading(false));
    } catch (err) {
      Sentry.captureException(err);
      warn(1, err);
      onClose();
    }
    dispatch(setLoading(false));
  };

  useEffect(async () => {
    if (open) {
      dispatch(setLoading(true));
      if (program != null) {
        try {
          const [poolSetting, _a] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from(anchor.utils.bytes.utf8.encode('SNS:STATE'))],
            program.programId
          );

          const pool = await program.account.poolSetting.fetch(poolSetting);
          let userToken = await findAssociatedTokenAddress(wallet.publicKey, new PublicKey(pool.mint));

          let unlock = pool.nftUnlock.toNumber();
          let numbers = pool.openPool.toNumber();
          let newDates = pool.nftCliff.toNumber();
          let current_timestamp = Math.floor(Date.now() / 1000);
          var newDate = new Date(newDates * 1000);
          if (current_timestamp >= unlock) {
            setStakeEnable(false);
          } else {
            setStakeEnable(true);
          }
          const year = newDate.getFullYear();
          const dailyStr = EstTime(numbers).slice(0, 8) + ' - ' + EstTime(newDates).slice(0, 8) + year;
          setDailyAccrual(dailyStr);
          setStartDate(EstTime(newDate.getTime() / 1000).slice(0, 8));
          let yeild = pool.nftBonusReward.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
          let daily = pool.nftSecReward.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
          let total = 0;
          let stake = null;
          try {
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
            stake = await program.account.stakeAccount.fetch(stakeAccount);
          } catch (err) {
            Sentry.captureException(err);
          }
          if (stake == null) {
            total = daily * (pool.nftCliff.toNumber() - pool.openPool.toNumber());
          } else {
            if (stake.status) {
              if (pool.dyfLaunch) {
                // total = daily * (pool.dyfLaunchTime.toNumber() - stake.lastRewardClaim.toNumber()) / 86400;
                total = daily * (pool.dyfLaunchTime.toNumber() - stake.lastRewardClaim.toNumber());
              } else {
                // total = daily * (pool.nftCliff.toNumber() - stake.lastRewardClaim.toNumber()) / 86400;
                total = daily * (pool.nftCliff.toNumber() - stake.lastRewardClaim.toNumber());
              }
            } else {
              // total = daily * (pool.nftCliff.toNumber() - pool.openPool.toNumber()) / 86400;
              total = daily * (pool.nftCliff.toNumber() - pool.openPool.toNumber());
            }
          }

          setTotal(total.toFixed(3).replace(/\.0+$/, ''));
          setDailySns((daily * 86400).toFixed(3).replace(/\.0+$/, ''));
          setYieldSNS(yeild.toFixed(3).replace(/\.0+$/, ''));
          setDyflaunchTime(EstTime(pool.dyfLaunchTime.toNumber()));
          setLockup(EstTime(unlock));
          setPoolOpen(EstTime(numbers));
          dispatch(setLoading(false));
        } catch (err) {
          Sentry.captureException(err);
          dispatch(setLoading(false));
          warn(1, err);
        }
      }
      dispatch(setLoading(false));
    }
  }, [open]);

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
          <Box className={classes.title}>Kanon NFT staking pool</Box>
          {
            <Grid container justifyContent="center" alignItems="center" spacing={3}>
              <Grid item xs={12} sm={12} lg={12}>
                <Box className={classes.smallStakeFrom}>
                  <Box className={classes.mainTitle}>Pool total rewards: {total} SNS</Box>
                  <Box className={classes.mainTitle}>
                    <Box className={classes.circle} />{' '}
                    <Box sx={{ wordBreak: 'break-all' }}>
                      {dailysns} SNS (daily accrual): {dailyAccrual}
                    </Box>
                  </Box>
                  <Box className={classes.mainTitle}>
                    <Box className={classes.circle} /> {yieldsns} SNS (Data Yield Farming promotion): Starting&nbsp;
                    {dyflaunchTime}
                  </Box>

                  <Box className={classes.mainTitle} sx={{ marginTop: '20px' }}>
                    Pool open:&nbsp;{poolOpen}
                  </Box>
                  <Box className={classes.mainTitle} sx={{ marginBottom: '20px' }}>
                    Pool lockup: Unstaking opens &nbsp;{lockup}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          }
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{ marginTop: '30px', textAlign: '-webkit-center' }}
          >
            <Grid item xs={12} sm={6} lg={6} justifyContent="center" alignItems="center">
              <Button
                fullWidth
                disabled={!stakeEnable}
                className={stakeEnable ? classes.btnEnable : classes.btnDisable}
                onClick={stakeEnable ? stakeNftToPool : null}
              >
                Stake
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NewStakeModal;


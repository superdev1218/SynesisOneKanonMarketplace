import React, { useEffect, useState } from 'react';
import {
  Box,
  Link,
  Typography,
  Button,
  List,
  Grid,
  ClickAwayListener,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  FormControl,
  Dialog,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  tableCellClasses,
  Tooltip
} from '@mui/material';
import * as Sentry from '@sentry/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LeftArrow } from '../../Common/Arrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Connection } from '@solana/web3.js';
import { Keypair, PublicKey } from '@solana/web3.js';
import { AccountInfo, MintInfo, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import axios from 'axios';
import { Metadata, MetadataProgram } from '@metaplex-foundation/mpl-token-metadata';
import { KanonProgramAdapter } from 'kanon-marketplace-sdk';
import * as anchor from '@project-serum/anchor';
import { Program, Provider, BN, web3 } from '@project-serum/anchor';
import { setLoading } from '../../../redux/ducks/main';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import CloseIcon from '@mui/icons-material/Close';
import HtmlFile from '../../Layouts/Footer/HtmlFile';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import LazyLoader from '../../../assets/loader.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Lightbox } from 'react-modal-image';
import {
  shortenAddress,
  calculateStep,
  serializeSellTransaction,
  listNftToMarket,
  checkIsListed,
  serializeUnlistTransaction,
  unlistFromMarket,
  getSaleHistory,
  EstHistoryTime,
  shortenTime
} from '../../../utils/helper';
import copy from 'copy-to-clipboard';
import AddStakeModal from '../StakeModal';
import NewStakeModal from '../NewStake';
import UnStakeModal from '../UnStakeModal';
import DarafarmJson from '../../../contracts/Contract.json';
import {
  getParsedNftAccountsByOwner,
  isValidSolanaAddress,
  createConnectionConfig,
  getParsedAccountByMint
} from '@nfteyez/sol-rayz';
import { NO_MORE_NFT, OUT_OF_NFTSAMOUNT, ERROR_CONDITION, errorData, toastConfig } from '../../Common/StaticData';
import { findAssociatedTokenAddress } from '../../../utils/helper';
import { LocalConvenienceStoreOutlined, SettingsSystemDaydream } from '@mui/icons-material';
import * as LANG from '../../../utils/constants';

const {
  REACT_APP_SERVER_URL,
  REACT_APP_PUBLIC_NETWORK,
  REACT_APP_ENDPOINT,
  REACT_APP_STAKE_NETWORK,
  REACT_APP_STAKE_PROGRAMID
} = process.env;

const { createTokenAccount, sleep, token, getTokenAccount } = require('@project-serum/common');

const opts = {
  preflightCommitment: 'processed'
};
const connection = new Connection(REACT_APP_ENDPOINT, opts.preflightCommitment);

const StakingType = {
  SNS: 1,
  NFT: 2,
  BOTH: 3
};

const Detail = () => {
  // const cardCtrl = useRef();
  // const [ setRef, { width, height } ] = useMeasure() ;

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [metadata, setMetaData] = useState(null);
  // const [KNProgram, setProgram] = useState(null);
  const [solValue, setSolValue] = useState(0);
  const [fullscreen, setFullScreen] = useState(false);

  const [titleOne, setTitleOne] = useState('Not Staked');
  const [titleTwo, setTitleTwo] = useState('Stake');

  const [tipFrom, setTipFrom] = useState([]);
  const [tipTo, setTipTo] = useState([]);
  const [tipAttr, setTipAttr] = useState([]);
  const [alertFlag, setAlertFlag] = useState(false);

  const { Keypair } = web3;
  const [nfts, setNfts] = useState([]);

  const [success, setSuccessflag] = useState(0);
  const [stake, setStake] = useState(false);
  const [unstake, setUnStake] = useState(false);
  const [pool, setPool] = useState(false);
  const fromArray = [];
  const toArray = [];

  const [poolNftStaked, setPoolNftStaked] = useState(false);
  const [poolMode, setPoolMode] = useState(-1);
  const [poolSnsStaked, setPoolSnsStaked] = useState(false);
  const [type, setType] = useState(1);

  const TokenInstructions = require('@project-serum/serum').TokenInstructions;

  const StakeProgramID = new PublicKey(REACT_APP_STAKE_PROGRAMID);
  const anchor = require('@project-serum/anchor');

  const [mintAddress, setMintAddress] = useState('');
  const [isListed, setListedStatus] = useState(false);
  const [listedPrice, setListedPrice] = useState(0);
  const [salesHistory, setSalesHistory] = useState([]);

  const wallet = useSelector((state) => state.main.wallet);
  const provider = useSelector((state) => state.main.provider);
  const KNProgram = useSelector((state) => state.main.KNProgram);
  const AHProgram = useSelector((state) => state.main.AHProgram);
  const ReduxAhIdl = useSelector((state) => state.main.ReduxAhIdl);
  const stakeProgram = useSelector((state) => state.main.stakeProgram);
  const stakeProvider = useSelector((state) => state.main.stakeProvider);

  const tipAttrOpen = (index) => {
    let temp = [...tipAttr];
    temp[index] = true;
    setTipAttr([...temp]);
  };

  const tipAttrClose = (index) => {
    let temp = [...tipAttr];
    temp[index] = false;
    setTipAttr([...temp]);
  };

  const tipFromOpen = (index) => {
    let temp = [...tipFrom];
    temp[index] = true;
    setTipFrom([...temp]);
  };

  const tipFromClose = (index) => {
    let temp = [...tipFrom];
    temp[index] = false;
    setTipFrom([...temp]);
  };

  const tipToOpen = (index) => {
    let temp = [...tipTo];
    temp[index] = true;
    setTipTo([...temp]);
  };

  const tipToClose = (index) => {
    let temp = [...tipTo];
    temp[index] = false;
    setTipTo([...temp]);
  };
  const copyAttr = (index, value) => {
    copy(value);
    tipAttrOpen(index);
  };

  useEffect(async () => {
    let tempfrom = [];
    if (metadata != null) {
      metadata.metadataExternal.attributes.map((item) => tempfrom.push(false));
    }
    setTipAttr([...tempfrom]);
  }, [metadata]);

  const setError = async (type, err) => {
    Sentry.captureException(err);
    if (type == 1) {
      let error_code = 0;

      let data = err.message.replace(/\s/g, ' ');
      data = data.slice(5, data.length);

      await toast.error(data, toastConfig);
      setStake(false);
      setUnStake(false);
      setPool(false);
      setAlertFlag(!alertFlag);
    }
    if (type == 2) {
      await toast.success(err, toastConfig);
      setStake(false);
      setUnStake(false);
      setPool(false);
    }
    if (type == 3) {
      await toast.success(err, toastConfig);
      setStake(false);
      setUnStake(false);
      setPool(false);
      setType(0);
    }
  };

  const handleSol = (event) => {
    setSolValue(event.target.value);
  };

  const getProvider = async () => {
    try {
      if (KNProgram == null) return;
      if (location.state == null) {
        navigate('/mywallet');
      } else {
        dispatch(setLoading(true));
        try {
          const nftsss = await getParsedAccountByMint({
            mintAddress: new PublicKey(location.state.nft_mint_address),
            connection: connection
          });
          const tempKeypair = anchor.web3.Keypair.generate();
          const t = new Token(connection, new PublicKey(location.state.nft_mint_address), TOKEN_PROGRAM_ID, tempKeypair);
          const ta = await t.getAccountInfo(new PublicKey(nftsss.pubkey));

          let metadataPDA = await Metadata.getPDA(location.state.nft_mint_address);
          let tokenMetadata = await Metadata.load(connection, metadataPDA);
          let metadataExternal = (await axios.get(tokenMetadata.data.data.uri)).data;

          let temp = {
            splTokenInfo: ta,
            metadataExternal: metadataExternal
          };

          setMetaData(temp);
          let res = await checkIsListed(wallet.publicKey.toBase58(), location.state.nft_mint_address);
          if (res) {
            if (res.data.result !== null) {
              if (res.data.result.length != 0) {
                setListedStatus(true);
                setListedPrice(res.data.result.price);
              }
              else {
                setListedStatus(false);
              }
            } else {
              setListedStatus(false);
            }
          } else {
            toast.error(LANG.ERR_WE_ARE_SORRY, toastConfig);
          }

          res = await getSaleHistory(location.state.nft_mint_address);
          setSalesHistory([...res]);
        } catch (err) {
          Sentry.captureException(err);
        }

        //staking detail

        let nftTokenAccount = await findAssociatedTokenAddress(
          wallet.publicKey,
          new PublicKey(location.state.nft_mint_address)
        );
        const userTokenAccount = new anchor.web3.PublicKey(nftTokenAccount.toBase58());

        //check stake status
        try {
          const [stakeAccount, bump] = await PublicKey.findProgramAddress(
            [
              userTokenAccount.toBuffer(),
              wallet.publicKey.toBuffer(),
              Buffer.from(anchor.utils.bytes.utf8.encode('SNS:STAKE'))
            ],
            stakeProgram.programId
          );
          const stake = await stakeProgram.account.stakeAccount.fetch(stakeAccount);
          if (stake.status == true) {
            setType(2);
          } else {
            setType(0);
          }
        } catch (err) {
          Sentry.captureException(err);
          setType(0);
        }

        dispatch(setLoading(false));
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useEffect(() => {
    dispatch(setLoading(true));
  }, []);

  useEffect(() => {
    if (wallet && wallet.connected && !wallet.disconnecting) {
      getProvider();
    } else {
      dispatch(setLoading(false));
      navigate('/mywallet');
    }
  }, [wallet]);

  useEffect(async () => {
    let tempfrom = [];
    salesHistory.map((item) => tempfrom.push(false));
    setTipFrom([...tempfrom]);
    setTipTo([...tempfrom]);
  }, [salesHistory]);

  useEffect(() => {
    if (type === 0) {
      setTitleOne('Not Staked');
      setTitleTwo('Details');
    }
    if (type === 1) {
      setTitleOne('Not Staked');
      setTitleTwo('STAKE');
    }
    if (type === 2) {
      setTitleOne('Staked');
      setTitleTwo('Details');
    }
  }, [type]);

  const handleUnlistNft = async () => {
    if (AHProgram == null) return;
    if (ReduxAhIdl == null) return;
    if (wallet == null) return;
    if (wallet.publicKey == null) return;
    if (parseFloat(listedPrice) <= 0) return;
    dispatch(setLoading(true));
    try {
      let mint = location.state.nft_mint_address;
      let listInfo = {
        nft_mint_address: mint,
        price: listedPrice,
        seller: wallet.publicKey.toBase58()
      };
      // List Nft transaction
      let info = await serializeUnlistTransaction(listInfo);
      if (info === null || info.instruction === null) {
        dispatch(setLoading(false));
        toast.error(LANG.ERR_WE_ARE_SORRY, toastConfig);
        return;
      }

      // deserialize transaction made in NFT server
      const tx = web3.Transaction.from(info.instruction);

      await wallet.signTransaction(tx);

      const ret = await unlistFromMarket({
        reservedOrderNumber: info.reservedOrderNumber,
        tx: [...new Uint8Array(tx.serialize())]
      });

      if (ret !== null) {
        toast.success(LANG.MSG_NFT_HAS_BEEN_UNLISTED_SUCCESSFULLY);
      } else {
        toast.error(LANG.ERR_WE_ARE_SORRY, toastConfig);
      }
    } catch (error) {
      Sentry.captureException(error);
      dispatch(setLoading(false));
      let error_code = 0;
      let data = error.message.replace(/\s/g, '');
      let tmparray = data.split(':');
      let index = tmparray.indexOf('customprogramerror');
      if (index != -1) {
        error_code = tmparray[index + 1];
      }
      error_code = Number(error_code);
      let error_index;
      error_index = ReduxAhIdl.errors.findIndex((item) => item.code == error_code);
      if (error_index == -1) {
        toast.error(LANG.ERR_WE_ARE_SORRY, toastConfig);
      } else {
        toast.error(errorData[error_index].msg, toastConfig);
      }
    }
    let res = await checkIsListed(wallet.publicKey.toBase58(), location.state.nft_mint_address);

    if (res) {
      if (res.data.result !== null) {
        if (res.data.result.length != 0) {
          setListedStatus(true);
          setListedPrice(res.data.result.price);
        }
        else {
          setListedStatus(false);
        }
      } else {
        setListedStatus(false);
      }
    }
    dispatch(setLoading(false));
  };
  const handleListNft = async () => {
    if (AHProgram == null) return;
    if (ReduxAhIdl == null) return;
    if (wallet == null) return;
    if (wallet.publicKey == null) return;
    if (parseFloat(solValue) <= 0) return;
    dispatch(setLoading(true));
    try {
      let mint = location.state.nft_mint_address;
      let listInfo = {
        nft_mint_address: mint,
        price: solValue,
        user: wallet.publicKey.toBase58()
      };
      // List Nft transaction
      let info = await serializeSellTransaction(listInfo);
      if (info === null || info.instruction === null) {
        dispatch(setLoading(false));
        toast.error(LANG.ERR_WE_ARE_SORRY, toastConfig);
        return;
      }

      // deserialize transaction made in NFT server
      const tx = web3.Transaction.from(info.instruction);

      await wallet.signTransaction(tx);

      const ret = await listNftToMarket({
        reservedOrderNumber: info.reservedOrderNumber,
        tx: [...new Uint8Array(tx.serialize())]
      });
      if (ret !== null) {
        toast.success(LANG.MSG_NFT_HAS_BEEN_LISTED_SUCCESSFULLY);
      } else {
        toast.error(LANG.ERR_WE_ARE_SORRY, toastConfig);
      }
    } catch (error) {
      Sentry.captureException(error);
      dispatch(setLoading(false));
      let error_code = 0;
      let data = error.message.replace(/\s/g, '');
      let tmparray = data.split(':');
      let index = tmparray.indexOf('customprogramerror');
      if (index != -1) {
        error_code = tmparray[index + 1];
      }
      error_code = Number(error_code);
      let error_index;
      error_index = ReduxAhIdl.errors.findIndex((item) => item.code == error_code);
      if (error_index == -1) {
        toast.error(LANG.ERR_WE_ARE_SORRY, toastConfig);
      } else {
        toast.error(errorData[error_index].msg, toastConfig);
      }
    }
    let res = await checkIsListed(wallet.publicKey.toBase58(), location.state.nft_mint_address);

    if (res) {
      if (res.data.result !== null) {
        setSolValue(0);
        setListedStatus(true);
        setListedPrice(res.data.result.price);
      } else {
        setListedStatus(false);
      }
    }
    dispatch(setLoading(false));
  };

  const setSuccess = async () => {
    await toast.success('Successful!', toastConfig);
    setType(2);
    setSuccessflag(1);
    setPoolNftStaked(true);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onFullScreenClose = () => {
    setFullScreen(false);
  };

  const onFullScreenImage = () => {
    setFullScreen(true);
  };

  const copyFrom = (index, value) => {
    copy(value);
    tipFromOpen(index);
  };

  const copyValue = (value, index) => {
    copy(value);
  };

  const copyTo = (index, value) => {
    copy(value);
    tipToOpen(index);
  };

  const onSolscan = (url) => {
    let home = 'https://explorer.solana.com/tx/' + url;
    window.open(home);
  };

  const onStake = async () => {
    if (type == 0) {
      setPool(true);
    } else if (type === 2) {
      const [poolSetting, _a] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode('SNS:STATE'))],
        stakeProgram.programId
      );

      const pool = await stakeProgram.account.poolSetting.fetch(poolSetting);
      let expire = pool.nftUnlock.toNumber();
      // console.log('nftTokenAccount:', nftTokenAccount.toBase58());
      // console.log('stakeAccount:', stakeAccount.toBase58());
      let current_timestamp = Math.floor(Date.now() / 1000);
      if (current_timestamp >= expire) {
        setUnStake(true);
      } else {
        setStake(true);
      }
    }
  };

  return (
    <Box className="mp-nft-detail">
      <ToastContainer />
      <Container>
        <Box className="flex justify-content-start mb-30">
          <Button className="mp-nft-detail-backbtn" onClick={() => navigate('/mywallet')}>
            <LeftArrow />
            <span className="text-lg ml-12 mt-3">Get back</span>
          </Button>
        </Box>
        {metadata != null && (
          <Box className="mp-nft-detail-main-content">
            <Box className="mp-nft-detail-card">
              <LazyLoadImage
                placeholderSrc={LazyLoader}
                effect="opacity"
                onClick={onFullScreenImage}
                src={metadata.metadataExternal.image}
                alt="collection"
              />
            </Box>
            <Box className="mp-nft-detail-description grow">
              <Box>
                <Box className="mp-nft-tag mb-6">{metadata.metadataExternal.collection.name}</Box>
                <Typography className="mp-nft-title mb-4">{metadata.metadataExternal.name}</Typography>
                <Typography className="mp-nft-creator mb-24"> {metadata.metadataExternal.description} </Typography>
                {/* <Typography className={classes.creatorText}> @custom_person </Typography> */}
              </Box>
              <Box className="mb-16">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={7}>
                    <Box className="round-box">
                      <Typography className="text-xl text-body mb-4">{isListed ? 'Listed' : 'Not Listed'} </Typography>
                      <Box className="flex justify-content-between align-items-center mb-12">
                        {!isListed ? (
                          <OutlinedInput
                            placeholder="List Price(SOL)"
                            onChange={handleSol}
                            type="number"
                            className="grow mr-12 outline-input"
                          />
                        ) : (
                          <Typography className="text-lg text-body mr-12">{listedPrice} SOL</Typography>
                        )}
                        {type != 2 ? (
                          <Button
                            className={!isListed ? 'button-gradient' : 'button-gray'}
                            onClick={isListed ? handleUnlistNft : handleListNft}
                          >
                            {isListed ? `UnList Now` : `List Now`}
                          </Button>
                        ) : (
                          <Button className="button-gray" disabled={true}>List Now</Button>
                        )}
                      </Box>
                      <Typography className="text-xs text-body-700">
                        By clicking 'List Now', you agree to
                        <Link onClick={handleOpen} sx={{ marginLeft: '5px' }} className="text-body cursor">
                          Terms&nbsp;of&nbsp;Service
                        </Link>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Box className="round-box">
                      <Typography className="text-xl text-body mb-4 text-center">{titleOne}</Typography>
                      <Box className="flex justify-content-center mb-12">
                        <Button
                          sx={{ color: 'white' }}
                          disabled={isListed}
                          className={isListed ? 'button-disabled ml-2 mr-2' : 'button-gradient ml-2 mr-2'}
                          onClick={onStake}
                        >
                          {titleTwo}
                        </Button>
                      </Box>
                      <Typography className="text-xs text-body-700 text-center">
                        Read more about &nbsp;
                        <Link
                          className="text-body cursor"
                          target="_blank"
                          href="https://medium.com/synesis-one/more-for-less-increasing-staking-reward-to-4-000-sns-for-kanon-staking-pool-f765f040d90a"
                        >
                          Staking
                        </Link>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <Accordion className="mp-nft-detail-accordion" defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon className="mp-nft-detail-accordion-icon" />}>
                  <Typography className="text-body text-xl">Attributes</Typography>
                </AccordionSummary>
                <AccordionDetails className="w-full flex">
                  {metadata.metadataExternal.attributes.length != 0 && tipAttr.length !== 0 && (
                    <Grid container spacing={2}>
                      {metadata.metadataExternal.attributes.map((element, index) => (
                        <Grid
                          item
                          xl={(metadata.metadataExternal.attributes.length == 1 ? 1 : 0 || index == 0 ? 1 : 0) == 1 ? 12 : 4}
                          lg={(metadata.metadataExternal.attributes.length == 1 ? 1 : 0 || index == 0 ? 1 : 0) == 1 ? 12 : 4}
                          sm={(metadata.metadataExternal.attributes.length == 1 ? 1 : 0 || index == 0 ? 1 : 0) == 1 ? 12 : 6}
                          xs={12}
                          key={index}
                        >
                          <ClickAwayListener onClickAway={() => tipAttrClose(index)}>
                            <div>
                              <Tooltip
                                PopperProps={{
                                  disablePortal: true
                                }}
                                onClose={() => tipAttrClose(index)}
                                open={tipAttr[index]}
                                disableFocusListener
                                disableHoverListener
                                disableTouchListener
                                title="Copied"
                              >
                                <Box
                                  onClick={() => copyAttr(index, element.value)}
                                  className="mp-nft-detail-accordion-property"
                                  key={index}
                                >
                                  <Typography className="text-body-600 text-xs cursor mb-1">{element.trait_type}</Typography>
                                  <Typography
                                    onClick={() => copyAttr(element.value, index)}
                                    className="text-body text-xs truncate"
                                  >
                                    {element.value}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            </div>
                          </ClickAwayListener>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </AccordionDetails>
              </Accordion>
              <Accordion className="mp-nft-detail-accordion" defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon className="mp-nft-detail-accordion-icon" />}>
                  <Typography className="text-body text-xl">Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box className="flex justify-content-between align-items-center pt-10 pb-10">
                    <Typography className="text-body text-xs cursor truncate shrink-0 mr-12">Mint address</Typography>
                    <ClickAwayListener onClickAway={() => tipAttrClose(999)}>
                      <Box className="truncate">
                        <Tooltip
                          PopperProps={{
                            disablePortal: true
                          }}
                          onClose={() => tipAttrClose(999)}
                          open={!!tipAttr[999]}
                          disableFocusListener
                          disableHoverListener
                          disableTouchListener
                          title="Copied"
                        >
                          <Box>
                            <Typography
                              onClick={() => copyAttr(999, metadata.splTokenInfo.mint.toBase58())}
                              className="text-body-600 text-xs truncate cursor"
                            >
                              {metadata.splTokenInfo.mint.toBase58()}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                    </ClickAwayListener>
                  </Box>
                  <Box className="flex justify-content-between align-items-center pt-10 pb-10">
                    <Typography className="text-body text-xs cursor truncate shrink-0 mr-12">Token address</Typography>
                    <ClickAwayListener onClickAway={() => tipAttrClose(998)}>
                      <Box className="truncate">
                        <Tooltip
                          PopperProps={{
                            disablePortal: true
                          }}
                          onClose={() => tipAttrClose(998)}
                          open={!!tipAttr[998]}
                          disableFocusListener
                          disableHoverListener
                          disableTouchListener
                          title="Copied"
                        >
                          <Box>
                            <Typography
                              onClick={() => copyAttr(998, metadata.splTokenInfo.address.toBase58())}
                              className="text-body-600 text-xs truncate cursor"
                            >
                              {metadata.splTokenInfo.address.toBase58()}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                    </ClickAwayListener>
                  </Box>
                  <Box className="flex justify-content-between align-items-center pt-10 pb-10">
                    <Typography className="text-body text-xs cursor truncate shrink-0 mr-12">Owner</Typography>
                    <ClickAwayListener onClickAway={() => tipAttrClose(997)}>
                      <Box className="truncate">
                        <Tooltip
                          PopperProps={{
                            disablePortal: true
                          }}
                          onClose={() => tipAttrClose(997)}
                          open={!!tipAttr[997]}
                          disableFocusListener
                          disableHoverListener
                          disableTouchListener
                          title="Copied"
                        >
                          <Box>
                            <Typography
                              onClick={() => copyAttr(997, metadata.splTokenInfo.owner.toBase58())}
                              className="text-body-600 text-xs truncate cursor"
                            >
                              {metadata.splTokenInfo.owner.toBase58()}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                    </ClickAwayListener>
                  </Box>
                  <Box className="flex justify-content-between align-items-center pt-10 pb-10">
                    <Typography className="text-body text-xs cursor truncate shrink-0 mr-12">Artist Royalties</Typography>
                    <Typography className="text-body-600 text-xs truncate">
                      {metadata.metadataExternal.seller_fee_basis_points / 100}%
                    </Typography>
                  </Box>
                  <Box className="flex justify-content-between align-items-center pt-10 pb-10">
                    <Typography className="text-body text-xs cursor truncate shrink-0 mr-12">Transaction Fee</Typography>
                    <Typography className="text-body-600 text-xs truncate">0%</Typography>
                  </Box>
                  <Box className="flex justify-content-between align-items-center pt-10 pb-10">
                    <Typography className="text-body text-xs cursor truncate shrink-0 mr-12">
                      Listing/Biding/Cancel
                    </Typography>
                    <Typography className="text-body-600 text-xs truncate">Free</Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
              <Accordion className="mp-nft-detail-accordion" defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon className="mp-nft-detail-accordion-icon" />}>
                  <Typography className="text-body text-xl"> Sales history </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer className="mp-nft-detail-sales-table">
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>PRICE</TableCell>
                          <TableCell className="text-center">FROM</TableCell>
                          <TableCell className="text-center">TO</TableCell>
                          <TableCell className="text-center">TxID</TableCell>
                          <TableCell align="right">TIME</TableCell>
                        </TableRow>
                      </TableHead>
                      {salesHistory.length !== 0 && tipTo.length !== 0 && (
                        <TableBody>
                          {salesHistory.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell component="th" scope="row">
                                {row.price} SOL
                              </TableCell>
                              <TableCell align="center">
                                <ClickAwayListener onClickAway={() => tipFromClose(index)}>
                                  <div>
                                    <Tooltip
                                      PopperProps={{
                                        disablePortal: true
                                      }}
                                      onClose={() => tipFromClose(index)}
                                      open={tipFrom[index]}
                                      disableFocusListener
                                      disableHoverListener
                                      disableTouchListener
                                      title="Copied"
                                    >
                                      <Button
                                        className="mp-nft-detail-address-link"
                                        onClick={() => copyFrom(index, row.seller_wallet_address)}
                                      >
                                        {shortenAddress(row.seller_wallet_address)}
                                      </Button>
                                    </Tooltip>
                                  </div>
                                </ClickAwayListener>
                              </TableCell>
                              <TableCell align="center">
                                <ClickAwayListener onClickAway={() => tipToClose(index)}>
                                  <div>
                                    <Tooltip
                                      PopperProps={{
                                        disablePortal: true
                                      }}
                                      onClose={() => tipToClose(index)}
                                      open={tipTo[index]}
                                      disableFocusListener
                                      disableHoverListener
                                      disableTouchListener
                                      title="Copied"
                                    >
                                      <Button
                                        className="mp-nft-detail-address-link"
                                        onClick={() => copyTo(index, row.buyer_wallet_address)}
                                      >
                                        {shortenAddress(row.buyer_wallet_address)}
                                      </Button>
                                    </Tooltip>
                                  </div>
                                </ClickAwayListener>
                              </TableCell>
                              <TableCell align="center" onClick={() => onSolscan(row.transaction_id)}>
                                <span className="mp-nft-detail-address-link">{shortenAddress(row.transaction_id)}</span>
                              </TableCell>
                              <TableCell className="text-right">{shortenTime(row.sale_date)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      )}
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Box>
        )}
      </Container>
      {fullscreen && (
        <Lightbox
          medium={metadata.metadataExternal.image}
          large={metadata.metadataExternal.image}
          hideZoom={false}
          showRotate={true}
          onClose={onFullScreenClose}
        />
      )}
      {
        <AddStakeModal
          open={stake}
          program={stakeProgram}
          warn={setError}
          mintAddress={location.state.nft_mint_address}
          success={success}
          stakeProvider={stakeProvider}
          onClose={() => setStake(false)}
        />
      }
      {
        <UnStakeModal
          open={unstake}
          program={stakeProgram}
          warn={setError}
          mintAddress={location.state.nft_mint_address}
          success={success}
          stakeProvider={stakeProvider}
          onClose={() => setUnStake(false)}
        />
      }
      <Dialog
        className="pm-footer-detail-modal"
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box sx={{ position: 'absolute', right: 10, top: 10, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box className="pm-footer-terms-text">
          <HtmlFile />
        </Box>
      </Dialog>
      {
        <NewStakeModal
          open={pool}
          program={stakeProgram}
          warn={setError}
          success={setSuccess}
          mintAddress={location.state.nft_mint_address}
          onClose={() => setPool(false)}
        />
      }
    </Box>
  );
};

export default Detail;


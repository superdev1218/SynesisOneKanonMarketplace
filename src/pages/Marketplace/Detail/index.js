import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Stack,
  Dialog,
  DialogContent,
  IconButton,
  Grid,
  ClickAwayListener,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  tableCellClasses,
  Tooltip
} from '@mui/material';
import * as Sentry from '@sentry/react';
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import {
  getParsedNftAccountsByOwner,
  isValidSolanaAddress,
  createConnectionConfig,
  getParsedAccountByMint
} from '@nfteyez/sol-rayz';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { WalletModalButton } from '@solana/wallet-adapter-react-ui';
import KanonColorButton from '../../../components/Common/KanonColorButton';
import { ChildCare } from '@mui/icons-material';
import { KanonProgramAdapter } from 'kanon-marketplace-sdk';
import LazyLoader from '../../../assets/loader.png';
import { Connection } from '@solana/web3.js';
import { Keypair, PublicKey } from '@solana/web3.js';
import { AccountInfo, MintInfo, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import axios from 'axios';
import { Metadata, MetadataProgram } from '@metaplex-foundation/mpl-token-metadata';
import * as anchor from '@project-serum/anchor';
import { Program, Provider, BN, web3 } from '@project-serum/anchor';
import { setLoading } from '../../../redux/ducks/main';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useMediaQuery } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  serializeBuyTransaction,
  buyNFT,
  checkIsListed,
  getSaleHistory,
  shortenTime,
  shortenAddress,
  EstHistoryTime
} from '../../../utils/helper';
import copy from 'copy-to-clipboard';
import { toast } from 'react-toastify';
import * as LANG from '../../../utils/constants';
import { errorData, toastConfig } from '../../../components/Common/StaticData';
import { height } from '@mui/system';
import LoaderImage from 'assets/loader.png';

const propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  item: PropTypes.object
};
const { REACT_APP_SERVER_URL, REACT_APP_PUBLIC_NETWORK, REACT_APP_ENDPOINT } = process.env;
const opts = {
  preflightCommitment: 'processed'
};
const connection = new Connection(REACT_APP_ENDPOINT, opts.preflightCommitment);

const DetailModal = ({ open, onClose, item, program, updatePage }) => {
  const isXs = useMediaQuery('(min-width:600px)');
  const [metadata, setMetadata] = useState(null);
  const dispatch = useDispatch();
  const [salesHistory, setSalesHistory] = useState([]);
  const wallet = useSelector((state) => state.main.wallet);
  const provider = useSelector((state) => state.main.provider);
  const AHProgram = useSelector((state) => state.main.AHProgram);
  const ReduxAhIdl = useSelector((state) => state.main.ReduxAhIdl);
  const [tipFrom, setTipFrom] = useState([]);
  const [tipTo, setTipTo] = useState([]);
  const [tipAttr, setTipAttr] = useState([]);
  const [walletFlag, setWalletFlag] = useState(false);
  const [disableBuy, setDisableBuy] = useState(true);

  useEffect(async () => {
    if (open == false) {
      setMetadata(null);
      return;
    }
    if (wallet && wallet.connected && !wallet.disconnecting) {
      if (item.seller_wallet_address == wallet.publicKey.toBase58()) {
        setDisableBuy(true);
      } else {
        setDisableBuy(false);
      }
      setWalletFlag(true);
    } else {
      setWalletFlag(false);
    }

    dispatch(setLoading(true));

    try {
      const nftsss = await getParsedAccountByMint({
        mintAddress: new PublicKey(item.nft_mint_address),
        connection: connection
      });
      const tempKeypair = anchor.web3.Keypair.generate();
      const t = new Token(connection, new PublicKey(item.nft_mint_address), TOKEN_PROGRAM_ID, tempKeypair);
      const ta = await t.getAccountInfo(new PublicKey(nftsss.pubkey));

      let metadataPDA = await Metadata.getPDA(item.nft_mint_address);
      let tokenMetadata = await Metadata.load(connection, metadataPDA);
      let metadataExternal = (await axios.get(tokenMetadata.data.data.uri)).data;

      let temp = {
        splTokenInfo: ta,
        metadataExternal: metadataExternal
      };

      setMetadata(temp);
      dispatch(setLoading(false));
      let res = await getSaleHistory(item.nft_mint_address);
      setSalesHistory([...res]);

      if (item.seller_wallet_address == wallet.publicKey.toBase58()) {
        setDisableBuy(true);
      } else {
        setDisableBuy(false);
      }

      res = await checkIsListed(item.seller_wallet_address, item.nft_mint_address);
      if (res) {
        if (res.data.result.length === 0 || res.data.result == null) {
          toast.error(LANG.ERR_ALREADY_SOLD, toastConfig);
          updatePage();
          onClose();
          return;
        } else {
        }
      }
    } catch (err) {
      Sentry.captureException(err);
    }
    dispatch(setLoading(false));
  }, [open]);

  useEffect(async () => {
    if (wallet && wallet.connected && !wallet.disconnecting) {
      if (item.seller_wallet_address == wallet.publicKey.toBase58()) setDisableBuy(true);
      else setDisableBuy(false);

      setWalletFlag(true);
    } else {
      setWalletFlag(false);
    }
  }, [wallet]);
  const copyFrom = (index, value) => {
    copy(value);
    tipFromOpen(index);
  };

  const copyTo = (index, value) => {
    copy(value);
    tipToOpen(index);
  };

  const copyAttr = (index, value) => {
    copy(value);
    tipAttrOpen(index);
  };

  const onSolscan = (url) => {
    let home = 'https://explorer.solana.com/tx/' + url;
    window.open(home);
  };

  useEffect(async () => {
    let tempfrom = [];
    salesHistory.map((item) => tempfrom.push(false));
    setTipFrom([...tempfrom]);
    setTipTo([...tempfrom]);
  }, [salesHistory]);

  useEffect(async () => {
    let tempfrom = [];
    if (metadata != null) {
      metadata.metadataExternal.attributes.map((item) => tempfrom.push(false));
    }
    setTipAttr([...tempfrom]);
  }, [metadata]);

  const handleBuyNFT = async () => {
    if (AHProgram == null) return;
    if (ReduxAhIdl == null) return;
    if (wallet == null) return;
    if (wallet.publicKey == null) return;
    if (parseFloat(item.price) <= 0) return;
    dispatch(setLoading(true));
    try {
      let listInfo = {
        nft_mint_address: item.nft_mint_address,
        price: item.price,
        seller: item.seller_wallet_address,
        buyer: wallet.publicKey.toBase58()
      };
      // List Nft transaction
      let info = await serializeBuyTransaction(listInfo);
      if (info === null || info.instruction === null) {
        dispatch(setLoading(false));
        toast.error(LANG.ERR_WE_ARE_SORRY, toastConfig);
        return;
      }

      // deserialize transaction made in NFT server
      const tx = web3.Transaction.from(info.instruction);

      await wallet.signTransaction(tx);

      const ret = await buyNFT({
        reservedOfferNumber: info.reservedOfferNumber,
        tx: [...new Uint8Array(tx.serialize())],
        buyer: wallet.publicKey.toBase58()
      });
      if (ret !== null) {
        toast.success(LANG.MSG_NFT_HAS_BEEN_TRANSFERED_SUCCESSFULLY);
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
    updatePage();
    onClose();
    dispatch(setLoading(false));
  };

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

  return (
    <Dialog className={'nft-detail-modal'} open={open} onClose={onClose} fullScreen={!isXs} maxWidth={'100%'}>
      {metadata != null && (
        <DialogContent className="nft-detail-modal-content">
          <IconButton onClick={onClose} aria-label="close" className="nft-detail-modal-content-close">
            <CloseIcon color={'white'} />
          </IconButton>
          <Box className="nft-image-box">
            <LazyLoadImage
              effect="opacity"
              placeholderSrc={LoaderImage}
              src={metadata.metadataExternal.image.toString()}
              alt="collection"
            />
          </Box>
          <Box className="nft-content-box">
            <Box className="nft-content-box-content">
              <Typography className="nft-content-box-content-tag">{metadata.metadataExternal.collection.name}</Typography>
              <Typography className="nft-content-box-content-title">{metadata.metadataExternal.name.toString()}</Typography>
              <Typography className="nft-content-box-content-creator">{metadata.metadataExternal.description}</Typography>
              {walletFlag == true && (
                <Box className="nft-content-box-content-wrapper">
                  <Stack direction="column" className="mr-24">
                    <Typography className="nft-content-box-content-price-title">Price</Typography>
                    <Typography className="nft-content-box-content-price">{item.price} SOL</Typography>
                  </Stack>
                  {
                    <KanonColorButton className="button-gradient" disabled={disableBuy} onClick={() => handleBuyNFT()}>
                      Buy NFT
                    </KanonColorButton>
                  }
                </Box>
              )}
              {walletFlag == false && (
                <Box className="nft-detail-modal-buy-div">
                  <WalletModalButton className="button-gradient">Connect wallet</WalletModalButton>
                </Box>
              )}
              <Box>
                <Accordion className="mp-nft-detail-accordion">
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon className="mp-nft-detail-accordion-icon" />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography className="text-body text-xl"> Attributes </Typography>
                  </AccordionSummary>
                  <AccordionDetails className="w-full flex">
                    {metadata.metadataExternal.attributes.length != 0 && tipAttr.length !== 0 && (
                      <Grid container spacing={1}>
                        {metadata.metadataExternal.attributes.map((element, index) => (
                          <Grid
                            item
                            xl={
                              (metadata.metadataExternal.attributes.length == 1 ? 1 : 0 || index == 0 ? 1 : 0) == 1 ? 12 : 4
                            }
                            lg={
                              (metadata.metadataExternal.attributes.length == 1 ? 1 : 0 || index == 0 ? 1 : 0) == 1 ? 12 : 4
                            }
                            sm={
                              (metadata.metadataExternal.attributes.length == 1 ? 1 : 0 || index == 0 ? 1 : 0) == 1 ? 12 : 6
                            }
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
                                    className="nft-detail-modal-properties-div"
                                    key={index}
                                  >
                                    <Typography className="text-xs text-body-600 truncate cursor">
                                      {' '}
                                      {element.trait_type}{' '}
                                    </Typography>
                                    <Typography className="body-text-600 text-xs shrink-0 mr-12">
                                      {' '}
                                      {element.value}{' '}
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
                <Accordion className="mp-nft-detail-accordion">
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon className="mp-nft-detail-accordion-icon" />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography className="text-body text-xl"> Details </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box className="w-full flex justify-content-between mr-10 p-10">
                      <Typography className="body-text-600 text-xs shrink-0 mr-12"> Mint address </Typography>
                      <Typography className="text-xs text-body-600 truncate cursor">
                        {' '}
                        {metadata.splTokenInfo.mint.toBase58()}{' '}
                      </Typography>
                    </Box>
                    <Box className="w-full flex justify-content-between mr-10 p-10">
                      <Typography className="body-text-600 text-xs shrink-0 mr-12"> Token address </Typography>
                      <Typography className="text-xs text-body-600 truncate cursor">
                        {' '}
                        {metadata.splTokenInfo.address.toBase58()}{' '}
                      </Typography>
                    </Box>
                    <Box className="w-full flex justify-content-between mr-10 p-10">
                      <Typography className="body-text-600 text-xs shrink-0 mr-12"> Owner </Typography>
                      <Typography className="text-xs text-body-600 truncate cursor">
                        {' '}
                        {metadata.splTokenInfo.owner.toBase58()}{' '}
                      </Typography>
                    </Box>
                    <Box className="w-full flex justify-content-between mr-10 p-10">
                      <Typography className="body-text-600 text-xs shrink-0 mr-12"> Artist Royalties </Typography>
                      <Typography className="text-xs text-body-600 truncate cursor">
                        {' '}
                        {metadata.metadataExternal.seller_fee_basis_points / 100}%{' '}
                      </Typography>
                    </Box>
                    <Box className="w-full flex justify-content-between mr-10 p-10">
                      <Typography className="body-text-600 text-xs shrink-0 mr-12"> Transaction Fee </Typography>
                      <Typography className="text-xs text-body-600 truncate cursor"> 0% </Typography>
                    </Box>
                    <Box className="w-full flex justify-content-between mr-10 p-10">
                      <Typography className="body-text-600 text-xs shrink-0 mr-12"> Listing/Biding/Cancel </Typography>
                      <Typography className="text-xs text-body-600 truncate cursor"> Free </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
                <Accordion className="mp-nft-detail-accordion" defaultExpanded={true}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon className="mp-nft-detail-accordion-icon" />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography className="text-body text-xl"> Sales history </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer className={'nft-detail-modal-sales-table'}>
                      <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                          <TableRow>
                            <TableCell align="left">PRICE</TableCell>
                            <TableCell align="left">FROM</TableCell>
                            <TableCell align="left">TO</TableCell>
                            <TableCell align="left">TxID</TableCell>
                            <TableCell align="right">TIME</TableCell>
                          </TableRow>
                        </TableHead>
                        {salesHistory.length !== 0 && tipTo.length !== 0 && (
                          <TableBody>
                            {salesHistory.map((row, index) => (
                              <TableRow key={index}>
                                <TableCell>{row.price} SOL</TableCell>
                                <TableCell sx={{ cursor: 'pointer' }}>
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
                                          className="nft-detail-modal-btn"
                                          onClick={() => copyFrom(index, row.seller_wallet_address)}
                                        >
                                          {shortenAddress(row.seller_wallet_address)}
                                        </Button>
                                      </Tooltip>
                                    </div>
                                  </ClickAwayListener>
                                </TableCell>
                                <TableCell align="left" sx={{ cursor: 'pointer' }}>
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
                                          className="nft-detail-modal-btn"
                                          onClick={() => copyTo(index, row.buyer_wallet_address)}
                                        >
                                          {shortenAddress(row.buyer_wallet_address)}
                                        </Button>
                                      </Tooltip>
                                    </div>
                                  </ClickAwayListener>
                                </TableCell>
                                <TableCell
                                  sx={{ cursor: 'pointer', color: '#6E56F8 !important' }}
                                  onClick={() => onSolscan(row.transaction_id)}
                                >
                                  {shortenAddress(row.transaction_id)}
                                </TableCell>
                                <TableCell className="text-right align-right">{shortenTime(row.sale_date)}</TableCell>
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
          </Box>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default DetailModal;


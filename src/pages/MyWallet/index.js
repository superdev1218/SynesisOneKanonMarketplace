import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Button, Grid, Box, Typography, InputBase, Paper, Container, CircularProgress, useMediaQuery } from '@mui/material';
import { Arrow, SearchIcon } from '../../components/Common/Arrow';
import KanonDefaultButton from '../../components/Common/KanonDefaultButton';
import AddClaimModal from '../../components/MyWallet/ClaimModal';
import { useSelector, useDispatch } from 'react-redux';
import { Connection } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { Program, Provider, BN, web3 } from '@project-serum/anchor';
import { Metadata, MetadataProgram } from '@metaplex-foundation/mpl-token-metadata';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { KanonProgramAdapter } from 'kanon-marketplace-sdk';
import KanonColorButton from '../../components/Common/KanonColorButton';
import { useNavigate, useLocation } from 'react-router-dom';
import * as anchor from '@project-serum/anchor';
import { getParsedNftAccountsByOwner, isValidSolanaAddress, createConnectionConfig } from '@nfteyez/sol-rayz';
import {
  allCollectionFilter1,
  getreservednftsbywallet,
  filtering,
  getMetadataByMintaddresses,
  calculateAirdropStep,
  getthumbnailbymintaddresses,
  getAddressCollections,
  MywalletPgSize,
  CallTime,
  checkreservednftamountbywallet,
  checkIsListed
} from '../../utils/helper';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastConfig, NO_NFTS } from '../../components/Common/StaticData';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import LoaderImage from '../../assets/loader.png';
import DarafarmJson from '../../contracts/Contract.json';
import { AppRegistrationRounded } from '@mui/icons-material';
import { findAssociatedTokenAddress } from '../../utils/helper';
import { AccountLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { common } from '@mui/material/colors';
const {
  REACT_APP_SERVER_URL,
  REACT_APP_PUBLIC_NETWORK,
  REACT_APP_ENDPOINT,
  REACT_APP_STAKE_NETWORK,
  REACT_APP_STAKE_PROGRAMID
} = process.env;

const StakingType = {
  SNS: 1,
  NFT: 2,
  BOTH: 3
};

const opts = {
  preflightCommitment: 'processed'
};

const connection = new Connection(REACT_APP_ENDPOINT, opts.preflightCommitment);

let interval;

const MyWallet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [step, setStep] = useState(-1);
  const [nfttokens, setNftTokens] = useState([]);
  const [airdropedlist, setAirdropedList] = useState([]);
  const [stakeNfts, setStakeNfts] = useState([]);

  const wallet = useSelector((state) => state.main.wallet);
  const provider = useSelector((state) => state.main.provider);
  const KNProgram = useSelector((state) => state.main.KNProgram);
  const stakeProgram = useSelector((state) => state.main.stakeProgram);
  const stakeProvider = useSelector((state) => state.main.stakeProvider);

  const [nonftsFlag, setNoNftsFlag] = useState(false);
  const [enable, setEnable] = useState(false);
  const [checkEnable, setCheckEnable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkLast, setCheckLast] = useState(false);
  const [poolNftStaked, setPoolNftStaked] = useState(false);
  const [metadata, setMetaData] = useState(null);
  const [stopTimer, setStopTimer] = useState(false);
  const [stakeFlag, setStakeFlag] = useState(false);
  const TokenInstructions = require('@project-serum/serum').TokenInstructions;

  const [rowCount, setRowCount] = useState(4);
  const match1 = useMediaQuery('(min-Width: 1472px)');
  const match2 = useMediaQuery('(min-Width: 1128px)');
  const match3 = useMediaQuery('(min-Width: 784px)');
  const match4 = useMediaQuery('(min-Width: 480px)');

  useEffect(() => {
    if (match1) setRowCount(4);
    else if (match2) setRowCount(3);
    else if (match3) setRowCount(2);
    else if (match4) setRowCount(1);
  });

  useEffect(async () => {
    if (checkEnable) {
      if (checkLast) {
        setEnable(false);
      }
      let nftsPda = await KNProgram.getNFTsbyPDA();
      if (nftsPda.length == 0) {
        setEnable(false);
        return;
      }
      let real = [];
      let nfts = await getreservednftsbywallet(wallet.publicKey.toBase58());
      real = nfts.filter((item) => {
        if (nftsPda.findIndex((val) => val.mint.toBase58() == item.nft_mint_address) != -1) {
          return true;
        } else {
          return false;
        }
      });
      if (real.length == 0) {
        setEnable(false);
      } else {
        if (real.length == 1) {
          setCheckLast(true);
        }
        if (wallet && wallet.connected && !wallet.disconnecting) {
          setEnable(true);
        } else {
          setEnable(false);
        }
      }
      // setEnable(result != 0)
      setCheckEnable(false);
    }
  }, [checkEnable]);

  useEffect(() => {
    if (stopTimer) {
      clearInterval(interval);
    }
  }, [nfttokens]);

  const getStakeNfts = async () => {
    try {
      setStakeFlag(true);
      let tokenList = await stakeProvider.connection.getTokenAccountsByOwner(wallet.publicKey, {
        programId: TOKEN_PROGRAM_ID
      });

      let temp_stake = [];

      await Promise.all(
        tokenList.value.map(async (e, index) => {
          const accountInfo = AccountLayout.decode(e.account.data);
          let nftTokenAccount = await findAssociatedTokenAddress(wallet.publicKey, new PublicKey(accountInfo.mint));

          const [stakeAccount, bump] = await PublicKey.findProgramAddress(
            [
              nftTokenAccount.toBuffer(),
              wallet.publicKey.toBuffer(),
              Buffer.from(anchor.utils.bytes.utf8.encode('SNS:STAKE'))
            ],
            stakeProgram.programId
          );

          try {
            const stakes = await stakeProgram.account.stakeAccount.fetch(stakeAccount);

            if (stakes.status === true) {
              const token_address = stakes.token;
              const tokenParse = await stakeProvider.connection.getParsedAccountInfo(token_address);
              const nft_mint = new anchor.web3.PublicKey(tokenParse.value.data.parsed.info.mint);
              const mint_address = nft_mint.toBase58();

              let check = temp_stake.find((element) => element === mint_address);

              if (check === undefined) {
                temp_stake.push(mint_address);
              }
            }
          } catch (err) {}
        })
      );
      if (temp_stake.length > 0) {
        let apiresult = await getMetadataByMintaddresses(null, temp_stake);
        setStakeNfts([...apiresult]);
        if (apiresult.length > 10) {
          let resdata = await getthumbnailbymintaddresses(null, 10, apiresult.length, temp_stake);
          resdata.map((item) => {
            let index = apiresult.findIndex((val) => val.nft_mint_address == item.nft_mint_address);
            if (index != -1) {
              apiresult[index].thumbnail = item.thumbnail;
              setStakeNfts([...apiresult]);
            }
          });
        }
      }
      setStakeFlag(false);
    } catch (err) {
      setStakeFlag(false);
      console.log(err);
    }
  };

  const getProvider = async () => {
    try {
      setCheckEnable(true);
      setLoading(true);
      let nfts = await KNProgram.getNFTsbyWallet(wallet.publicKey);

      if (nfts.length == 0) {
        if (wallet && wallet.connected && !wallet.disconnecting) {
          setNftTokens([...airdropedlist]);
        } else {
          setNftTokens([]);
        }
        setLoading(false);
        return;
      }

      let mintaddress = [];
      nfts.map((item) => mintaddress.push(item.mint.toBase58()));
      let apiresult = await getMetadataByMintaddresses(null, mintaddress);

      let temp = [...apiresult];
      if (airdropedlist.length != 0) {
        airdropedlist.map((item) => temp.push(item));
      }

      setNftTokens([...temp]);

      let showCount = -1;
      if (apiresult.length > 10) {
        showCount++;
        let resdata = await getthumbnailbymintaddresses(null, 10, MywalletPgSize, mintaddress);
        resdata.map((item) => {
          let index = apiresult.findIndex((val) => val.nft_mint_address == item.nft_mint_address);
          if (index != -1) {
            apiresult[index].thumbnail = item.thumbnail;
          }
        });
        temp = [...apiresult];
        if (airdropedlist.length != 0) {
          airdropedlist.map((item) => temp.push(item));
        }

        setNftTokens([...temp]);
        if (10 + MywalletPgSize >= apiresult.length) {
          setLoading(false);
          return;
        }

        interval = setInterval(() => {
          showCount++;
          getthumbnailbymintaddresses(null, 10 + showCount * MywalletPgSize, MywalletPgSize, mintaddress).then((resdata) => {
            resdata.map((item) => {
              let index = apiresult.findIndex((val) => val.nft_mint_address == item.nft_mint_address);
              if (index != -1) {
                apiresult[index].thumbnail = item.thumbnail;
              }
            });
            temp = [...apiresult];
            if (airdropedlist.length != 0) {
              airdropedlist.map((item) => temp.push(item));
            }
            setNftTokens([...temp]);
            if (10 + (showCount + 1) * MywalletPgSize >= apiresult.length) {
              setLoading(false);
            }
          });
          if (10 + (showCount + 1) * MywalletPgSize >= apiresult.length) {
            clearInterval(interval);
          }
        }, CallTime);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (nonftsFlag) {
      toast.warn(NO_NFTS, toastConfig);
    }
  }, [nonftsFlag]);

  useEffect(() => {
    if (wallet && wallet.connected && !wallet.disconnecting) {
      setNftTokens([]);
      setAirdropedList([]);
      getStakeNfts();
      getProvider();
      setStopTimer(false);
    } else {
      clearInterval(interval);
      setStep(0);
      setEnable(false);
      // setProgram(null);
      setNftTokens([]);
      setLoading(false);
      setAirdropedList([]);
      setStopTimer(true);
    }
  }, [wallet]);

  const addNewAirdrop = (new_val) => {
    let temp = [...nfttokens];
    let tmp1 = [...airdropedlist];
    temp.push(new_val);
    tmp1.push(airdropedlist);
    setNftTokens([...temp]);

    setAirdropedList([...tmp1]);
  };

  const Tag = ({ type }) => {
    return <Box className="mp-nft-cards-list-card-inner-tag">{type}</Box>;
  };

  const showCard = () => {
    let tempnfts = nfttokens.filter((val) => val.thumbnail != null);
    let staketempnfts = stakeNfts.filter((val) => val.thumbnail != null);

    tempnfts = [...staketempnfts, ...tempnfts];

    let length = parseInt(tempnfts.length);
    let rows = [];

    for (let i = 0; i < length / rowCount; i++) {
      let row = [];
      for (let j = 0; j < rowCount; j++) {
        const item = tempnfts[i * rowCount + j];
        if (item) {
          row.push(
            <Box key={'card' + i.toString() + '-' + j.toString()} className="mp-nft-cards-list-card">
              <Box
                className="mp-nft-cards-list-card-inner"
                onClick={() => {
                  navigate('/mywallet/detail', { state: item });
                }}
              >
                <Tag type={item.collection_name} />
                <LazyLoadImage
                  placeholderSrc={LoaderImage}
                  effect="opacity"
                  src={`data:image/png;base64,${item.thumbnail}`}
                  alt="collection"
                  className="mp-nft-cards-list-card-inner-img"
                />
                <Typography className="nft-card-title truncate">{item.nft_name.toString()}</Typography>
                {item.is_listed ? (
                  <Typography className="nft-card-sol">Listed</Typography>
                ) : (
                  <Typography className="nft-card-staked">
                    {i * rowCount + j < staketempnfts.length ? 'Staked' : ''}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        } else {
          row.push(<Box key={'card-place-' + i.toString() + '-' + j.toString()} className="mp-nft-cards-list-card"></Box>);
        }
      }
      rows.push(
        <div key={'row-' + i} className="flex justify-content-between w-full">
          {row}
        </div>
      );
    }
    return rows;
  };
  return (
    <Box className="mp-marketplace">
      <div className="mp-marketplace-inner">
        <Container>
          <div className="mp-marketplace-title-section">
            <Grid container spacing={6}>
              <Grid item xs={12} md={12} lg={6}>
                <div className="mp-marketplace-title">My Wallet</div>
              </Grid>
              {enable && (
                <Grid item xs={12} lg={6}>
                  <div className="flex justify-content-end">
                    <KanonColorButton onClick={() => setShowDetailModal(true)}>Claim Airdrop</KanonColorButton>
                  </div>
                </Grid>
              )}
            </Grid>
          </div>
          <div>
            {enable && (
              <AddClaimModal
                open={showDetailModal}
                setAirdropedList={addNewAirdrop}
                setClaimFlag={() => setCheckEnable(true)}
                onClose={() => setShowDetailModal(false)}
              />
            )}
            {stopTimer ? (
              <Box className="flex justify-content-center mt-5 pb-5">
                <Typography className="text-2xl">No Kanon NFTs yet in your wallet</Typography>
              </Box>
            ) : (
              <>
                {<Box className="mp-nft-cards-list">{showCard()}</Box>}
                {(loading || stakeFlag) && (
                  <Box className="flex justify-content-center mt-5 pb-5">
                    <CircularProgress disableShrink />
                  </Box>
                )}
                {nfttokens.length == 0 && !loading && !stakeFlag && (
                  <Box className="flex justify-content-center mt-5 pb-5">
                    <Typography className="text-2xl">No Kanon NFTs yet in your wallet</Typography>
                  </Box>
                )}
              </>
            )}
          </div>
        </Container>
      </div>
      <ToastContainer />
    </Box>
  );
};

export default MyWallet;


import React from 'react';

import { store as confluxStore, Unit, useBalance, connect } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { store as ethereumStore, useBalance as useBalanceEth } from '@cfxjs/use-wallet-react/ethereum';
import Button from 'common/components/Button';
import { Link } from 'react-router-dom';
import { useChainIdNative, usePosLockArrOrigin, usePowLockOrigin } from 'governance/src/store/lockDays&blockNumber';
import { spaceSeat } from 'common/conf/Networks';
import { isSameChainNativeWallet } from 'common/hooks/useIsSameChainNativeWallet';
import BalanceText from 'common/modules/BalanceText';
import NotConnected from 'governance/src/assets//notConnected.svg';
import TotalStake0 from 'governance/src/assets//totalStake0.svg';

type ToolTipProps = {
    des: string;
} & React.HTMLAttributes<HTMLDivElement>;

const ToolTip = ({ des, ...props }: ToolTipProps) => {
    return (
        <div
            className='bg-white absolute z-10 top-[-14px] py-[2px] px-[4px] left-0 padding text-[#808BE7] border-[1px] border-solid border-[#808BE7] rounded-tl-[9px] rounded-r-[9px] text-xs'
            {...props}
        >
            {des}
        </div>
    )
};

const zero = Unit.fromMinUnit(0);



const Statistics: React.FC = () => {
    const getAccount = () => confluxStore.getState().accounts?.[0];
    const getEthereumAccount = () => ethereumStore.getState().accounts?.[0];

    const account = getAccount();
    const ethereumAccount = getEthereumAccount() || '';

    const chainIdNative = useChainIdNative();
    const isSameChain = isSameChainNativeWallet();

    const isESpace = spaceSeat(chainIdNative) === 'eSpace';
    const isCoreSpace = spaceSeat(chainIdNative) === 'core';

    const posLockArrOrigin = usePosLockArrOrigin();
    const powLockOrigin = usePowLockOrigin();

    const posTotalStaked = posLockArrOrigin && posLockArrOrigin.length > 0 ? posLockArrOrigin.reduce((pre, cur) => pre.add(cur.stakeAmount), Unit.fromMinUnit(0)) : Unit.fromMinUnit(0);
    const totalStaked = isCoreSpace && powLockOrigin?.stakeAmount ? (posTotalStaked.add(powLockOrigin.stakeAmount)) : posTotalStaked;

    const posTotalLocked = posLockArrOrigin && posLockArrOrigin.length > 0 ? posLockArrOrigin.reduce((pre, cur) => pre.add(cur.lockAmount), Unit.fromMinUnit(0)) : Unit.fromMinUnit(0);
    const totalLocked = isCoreSpace && powLockOrigin?.lockAmount ? (posTotalLocked.add(powLockOrigin.lockAmount)) : posTotalLocked;

    const posTotalPower = posLockArrOrigin && posLockArrOrigin.length > 0 ? posLockArrOrigin.reduce((pre, cur) => pre.add(cur.votePower), Unit.fromMinUnit(0)) : Unit.fromMinUnit(0);
    const totalPower = isCoreSpace && powLockOrigin?.votePower ? (posTotalPower.add(powLockOrigin.votePower)) : posTotalPower;

    const balance = isESpace ? useBalanceEth() : useBalance();

    const totalBalance = balance?.add(totalStaked || 0);

    return (
        <div>
            <div className='mt-[16px] flex gap-[24px]'>
                <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                    <div className='text-[12px] text-[#898D9A]'>Total Balance</div>
                    <BalanceText className='text-[16px] text-[#1B1B1C]' id="Dashboard Total Balance" balance={isSameChain ? totalBalance : false} symbol="CFX" decimals={18} />
                </div>
                <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                    <div className='text-[13px] text-[#898D9A]'>Available Balance</div>
                    <BalanceText
                        className="text-[16px] text-[#3D3F4C]"
                        id="Dashboard Available Balance"
                        balance={isSameChain ? balance : false}
                        symbol={'CFX'}
                        decimals={18}
                    />
                    <div className='flex mt-[16px]'>

                        <Link to="https://www.conflux-pos-validators.com/" target='_block'>
                            <Button
                                className='w-[100px] relative'>
                                <ToolTip des="APY: ~10%+" />
                                <span>PoS Stake</span>
                            </Button>
                        </Link>
                        {
                            !isESpace && <Link to="/governance/pow-stake">
                                <Button className='w-[100px] ml-[16px]' variant='outlined'>PoW Stake</Button>
                            </Link>
                        }

                    </div>

                </div>
                <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                    <div className='text-[12px] text-[#898D9A]'>Total Staked</div>
                    <BalanceText className='text-[16px] text-[#1B1B1C]' id="Dashboard Total Staked" balance={isSameChain ? totalStaked : false} symbol="CFX" decimals={18} />
                </div>
                <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                    <div className='text-[12px] text-[#898D9A]'>Total Locked</div>
                    <BalanceText className='text-[16px] text-[#1B1B1C]' id="Dashboard Total Locked" balance={isSameChain ? totalLocked : false} symbol="CFX" decimals={18} />
                    <div className='mt-[16px] text-[14px]'>
                        <span className='text-[#898D9A]'>Voting Power:</span>
                        <BalanceText className='text-[#3D3F4C]' id="Dashboard Voting Power" balance={isSameChain ? totalPower : false} symbol="" />
                    </div>
                </div>
            </div>

            {
                isESpace ?
                    ethereumAccount ?
                        isSameChain ?
                            totalStaked?.equals(zero) ?
                                <div className='w-full flex flex-col justify-center my-[48px]'>
                                    <img className='w-fit m-auto' src={TotalStake0} alt="total stake 0" />
                                </div>
                                :
                                <></>
                            :
                            <div className='w-full flex flex-col justify-center my-[48px]'>
                                <img className='w-fit m-auto' src={NotConnected} alt="Not connected" />
                                <p className='mt-[12px] text-[16px] text-[#898D9A] text-center'>切换网络</p>
                            </div>
                        :

                        <div className='w-full flex flex-col justify-center my-[48px]'>
                            <img className='w-fit m-auto' src={NotConnected} alt="Not connected" />
                            <p className='mt-[12px] text-[16px] text-[#898D9A] text-center'><span className='text-[#808BE7] cursor-pointer' onClick={connect}>Connect MetaMask Wallet</span> to see more</p>
                        </div>
                    :
                    account ?
                        isSameChain ?
                            totalStaked?.equals(zero) ?
                                <div className='w-full flex flex-col justify-center my-[48px]'>
                                    <img className='w-fit m-auto' src={TotalStake0} alt="total stake 0" />
                                </div>
                                :
                                <></>
                            :
                            <div className='w-full flex flex-col justify-center my-[48px]'>
                                <img className='w-fit m-auto' src={NotConnected} alt="Not connected" />
                                <p className='mt-[12px] text-[16px] text-[#898D9A] text-center'>切换网络</p>
                            </div>
                        :

                        <div className='w-full flex flex-col justify-center my-[48px]'>
                            <img className='w-fit m-auto' src={NotConnected} alt="Not connected" />
                            <p className='mt-[12px] text-[16px] text-[#898D9A] text-center'><span className='text-[#808BE7] cursor-pointer' onClick={connect}>Connect Fluent Wallet</span> to see more</p>
                        </div>
            }
        </div>

    );
};

export default Statistics;

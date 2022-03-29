import React, { useEffect, useCallback, useState } from 'react';
import cx from 'clsx';
import { useForm } from 'react-hook-form';
import { useAccount, useStatus, Unit } from '@cfxjs/use-wallet/dist/ethereum';
import { useBalance, useMaxAvailableBalance, useNeedApprove, useToken, useCurrentFromNetwork, useAntoherNetwork, setTransferBalance } from 'espace-bridge/src/store';
import useI18n from 'common/hooks/useI18n';
import Input from 'common/components/Input';
import Spin from 'common/components/Spin';
import AuthConnectButton from 'common/modules/AuthConnectButton';
import BalanceText from 'common/modules/BalanceText';
import numFormat from 'common/utils/numFormat';
import TokenList from 'espace-bridge/src/components/TokenList';
import ChainSelect from './ChainSelect';

const transitions = {
    en: {},
    zh: {},
} as const;

const Send: React.FC = () => {
    const i18n = useI18n(transitions);

    return (
        <div className="">
            <ChainSelect />
            <TokenList />
            <Form />
        </div>
    );
};


const Form: React.FC = () => {
    const { register, handleSubmit: withForm, setValue } = useForm();
	const [receiveBalance, setReceiveBalance] = useState<Unit | undefined>(undefined);

    const token = useToken();
    const currentFromNetwork = useCurrentFromNetwork();
    const antoherNetwork = useAntoherNetwork();

    const metaMaskAccount = useAccount();
    const metaMaskStatus = useStatus();
    const balance = useBalance();
    const maxAvailableBalance = useMaxAvailableBalance();
    const needApprove = useNeedApprove(token);

    const setAmount = useCallback((val: string) => {
		const _val = val.replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');
		setValue('amount', _val);
		setTransferBalance(_val);

		setReceiveBalance(_val ? Unit.fromStandardUnit(_val) : undefined);
	}, [token])

	useEffect(() => setAmount(''), [metaMaskAccount, token]);

    const handleCheckAmount = useCallback(async (evt: React.FocusEvent<HTMLInputElement, Element>) => {
		if (!evt.target.value) {
			return setAmount('');
		}
		if (Number(evt.target.value) < 0) {
			return setAmount('');
		}

		if (!maxAvailableBalance) return;

		return setAmount(evt.target.value);
	}, [maxAvailableBalance]);

	const handleClickMax = useCallback(() => {
		if (!maxAvailableBalance) return;
		setAmount(maxAvailableBalance.toDecimalStandardUnit());
	}, [maxAvailableBalance])

	const isBalanceGreaterThan0 = maxAvailableBalance && Unit.greaterThan(maxAvailableBalance, Unit.fromStandardUnit(0));
	const canClickButton = needApprove === true || (needApprove === false && isBalanceGreaterThan0);
    
    return (
        <form>
            <Input
				id="core2eSpace-transferAamount-input"
				className='pr-[52px]'
				wrapperClassName='mt-[16px] mb-[12px]'
				placeholder="Amount you want to transfer"
				type="number"
				step={1e-18}
				min={Unit.fromMinUnit(1).toDecimalStandardUnit()}
				max={maxAvailableBalance?.toDecimalStandardUnit()}
				disabled={!isBalanceGreaterThan0}
				{...register('amount', { required: !needApprove, min: Unit.fromMinUnit(1).toDecimalStandardUnit(), max: maxAvailableBalance?.toDecimalStandardUnit(), onBlur: handleCheckAmount})}
				suffix={
					<button
						id="core2eSpace-transferAamount-max"
						className={cx("absolute right-[16px] top-[50%] -translate-y-[50%] text-[14px] text-[#808BE7] cursor-pointer", isBalanceGreaterThan0 && 'hover:underline')}
						onClick={handleClickMax}
						disabled={!isBalanceGreaterThan0}
						type="button"
					>
						MAX
					</button>
				}
			/>
            
			<p className="text-[14px] leading-[18px] text-[#3D3F4C] whitespace-nowrap">
				<span style={{ color: currentFromNetwork.color }}>{currentFromNetwork.name}</span> Balance:
				<BalanceText className="ml-[4px]" balance={balance} id="wallet-balance" symbol={token.symbol} status={metaMaskStatus} />
			</p>
			<p className="mt-[20px] text-[14px] leading-[18px] text-[#3D3F4C] whitespace-nowrap">
				Will receive on <span style={{ color: antoherNetwork.color }}>{antoherNetwork.name}</span>:
				<BalanceText className="ml-[4px]" id="will-receive" balance={receiveBalance} symbol={token.symbol} />
			</p>

            <AuthConnectButton
                id="eSpaceBridge-Send-Auth"
                className="mt-[24px]"
				wallet="MetaMask"
				buttonType="contained"
				buttonSize="normal"
				fullWidth
				type="button"
                useMetaMaskNetwork={useCurrentFromNetwork}
				authContent={() => 
					<button
						id="eSpaceBridge-Send"
						className='mt-[24px] button-contained button-normal w-full'
						disabled={!canClickButton}
					>
						{needApprove ? 'Approve' : needApprove === false ? 'Send' : <Spin className='text-[28px] text-white' />}
					</button>					
				}
			/>
        </form>
    );
}


export default Send;

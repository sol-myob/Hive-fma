import '../css/rules.css';
import { FunctionComponent, h } from 'preact';
import { useReducer } from 'preact/hooks';
import AntRules from './rules/AntRules';
import BeetleRules from './rules/BeetleRules';
import FreedomToMove from './rules/FreedomToMove';
import GrasshopperRules from './rules/GrasshopperRules';
import Modal from './Modal';
import Objective from './rules/Objective';
import OneHiveRule from './rules/OneHiveRule';
import QueenRules from './rules/QueenRules';
import SpiderRules from './rules/SpiderRules';

type Props = { setShowRules: (value: boolean) => void };

const Rules: FunctionComponent<Props> = (props) => {
  const ruleList = [
    <Objective />,
    <QueenRules />,
    <BeetleRules />,
    <SpiderRules />,
    <GrasshopperRules />,
    <AntRules />,
    <OneHiveRule />,
    <FreedomToMove />,
  ];
  const changeRule = (currentRuleIndex: number, { type }: { type: 'next' | 'prev' }): number => {
    if (type === 'next') return ++currentRuleIndex % ruleList.length;
    if (type === 'prev' && currentRuleIndex > 0) return --currentRuleIndex % ruleList.length;
    return ruleList.length - 1;
  };
  const [currentRuleIndex, changeCurrentRule] = useReducer(changeRule, 0);
  return (
    <Modal name="rules" onClose={() => props.setShowRules(false)}>
      <div class="menu">
        <button title="Previous" onClick={() => changeCurrentRule({ type: 'prev' })}>
          &lt;
        </button>
        <button title="Next" onClick={() => changeCurrentRule({ type: 'next' })}>
          &gt;
        </button>
      </div>
      {ruleList[currentRuleIndex]}
    </Modal>
  );
};

Rules.displayName = 'Rules';
export default Rules;

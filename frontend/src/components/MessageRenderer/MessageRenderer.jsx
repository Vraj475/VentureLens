import BotTextMessage from '../messages/BotTextMessage';
import UserTextMessage from '../messages/UserTextMessage';
import TypingMessage from '../messages/TypingMessage';
import OptionsMessage from '../messages/OptionsMessage';
import ChartMessage from '../messages/ChartMessage';
import RiskCardsMessage from '../messages/RiskCardsMessage';
import AssumptionsMessage from '../messages/AssumptionsMessage';
import DevilMessage from '../messages/DevilMessage';
import DownloadMessage from '../messages/DownloadMessage';
import { useAuth } from '../../context/AuthContext';

function MessageRenderer({ message, onOptionSelect, optionsDisabled }) {
  const { userProfile } = useAuth();

  switch (message.type) {
    case 'bot-text':
      return <BotTextMessage content={message.content} />;
    case 'user-text':
      return <UserTextMessage content={message.content} />;
    case 'typing':
      return <TypingMessage />;
    case 'options':
      return (
        <OptionsMessage
          content={message.content}
          onSelect={onOptionSelect}
          disabled={optionsDisabled}
        />
      );
    case 'chart':
      return <ChartMessage content={message.content} />;
    case 'risk-cards':
      return <RiskCardsMessage content={message.content} />;
    case 'assumptions':
      return <AssumptionsMessage content={message.content} />;
    case 'devil':
      if (userProfile?.settings?.devilsAdvocate === false) return null;
      return <DevilMessage content={message.content} />;
    case 'download':
      return <DownloadMessage content={message.content} />;
    default:
      return null;
  }
}

export default MessageRenderer;

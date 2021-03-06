import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { deepOrange500 } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';

import Settings from '../components/settings';
import RepeatPanel from '../components/repeatPanel';
import WordPanel from '../components/wordPanel';
import EditingDialog from '../components/editingDialog';
import Word from '../models/word';

// Make sure react-tap-event-plugin only gets injected once
// Needed for material-ui
if (!process.tapEventInjected) {
  injectTapEventPlugin();
  process.tapEventInjected = true;
}

const styles = {
  container: {
    paddingTop: 100,
  },
};

const muiTheme = {
  palette: {
    accent1Color: deepOrange500,
  },
};

class Index extends React.Component {
  static getInitialProps({ req }) {
    // Ensures material-ui renders the correct css prefixes server-side
    let userAgent;
    if (process.browser) {
      userAgent = global.navigator.userAgent;
    } else {
      userAgent = req.headers['user-agent'];
    }

    return { userAgent };
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      words: [],
      editingWordIndex: this.initialEditingWordIndex,
      repeatThreshold: 5,
      shouldAutoTranslate: true,
      shouldPronounce: true,
    };
  }

  componentDidMount() {
    this.fetchWords();
  }

  initialEditingWordIndex = -1;

  fetchWords = () => {
    const storedWordsData = window.localStorage.getItem('words');
    if (storedWordsData) {
      this.setState({
        words: JSON.parse(storedWordsData).map(wordObject => Object.assign(new Word(), wordObject)),
      });
    }
  };

  storeWords = () => {
    window.localStorage.setItem('words', JSON.stringify(this.state.words));
  };

  handleRepeatSave = (savedWord) => {
    this.setState({
      words: this.state.words.concat(savedWord),
    }, this.storeWords);
  };

  handleSettingsSave = (settings) => {
    this.setState({ ...settings });
  };

  handleCancelEditingWord = () => {
    this.setState({ editingWordIndex: this.initialEditingWordIndex });
  };

  handleDeleteEditingWord = () => {
    this.setState({
      editingWordIndex: this.initialEditingWordIndex,
      words: this.state.words.filter((word, index) => index !== this.state.editingWordIndex),
    }, this.storeWords);
  };

  handleUpdateEditingWord = (updatedWord) => {
    if (updatedWord.spelling) {
      this.setState({
        editingWordIndex: this.initialEditingWordIndex,
        words: this.state.words.map((word, index) =>
          (index === this.state.editingWordIndex ? updatedWord : word)),
      }, this.storeWords);
    } else {
      this.handleDeleteEditingWord();
    }
  };

  handleWordPress = (wordIndex) => {
    this.setState({ editingWordIndex: wordIndex });
  };

  render() {
    const { userAgent } = this.props;
    return (
      <MuiThemeProvider muiTheme={getMuiTheme({ userAgent, ...muiTheme })}>
        <div style={styles.container}>
          <Head>
            <title>Word Fight!</title>
            <meta charSet="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
            />
          </Head>
          <Settings
            repeatThreshold={this.state.repeatThreshold}
            shouldAutoTranslate={this.state.shouldAutoTranslate}
            shouldPronounce={this.state.shouldPronounce}
            onSave={this.handleSettingsSave}
          />
          <RepeatPanel
            repeatThreshold={this.state.repeatThreshold}
            shouldAutoTranslate={this.state.shouldAutoTranslate}
            shouldPronounce={this.state.shouldPronounce}
            onSave={this.handleRepeatSave}
          />
          <WordPanel
            words={this.state.words}
            onWordPress={this.handleWordPress}
          />
          <EditingDialog
            isOpen={this.state.editingWordIndex !== this.initialEditingWordIndex}
            onClose={this.handleCancelEditingWord}
            onUpdate={this.handleUpdateEditingWord}
            onDelete={this.handleDeleteEditingWord}
            word={this.state.words[this.state.editingWordIndex]}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

Index.propTypes = {
  userAgent: PropTypes.string.isRequired,
};

export default Index;

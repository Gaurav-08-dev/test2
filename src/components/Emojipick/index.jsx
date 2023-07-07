import React, { useState } from "react";
import emojiList from "./utils/emojiList.json";
import "./EmojiPicker.scss";

const EmojiPicker = ({ onEmojiClick , theme="light"}) => {

  const [skinTone, setSkinTone] = useState(0);
  const [showTone, setShowTone] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [searchText, setSearchText] = useState("");

  const getEmojiWithSkinTone = (emoji) => {
    if(skinTone === 0) {
      const baseEmoji = emoji.code;
      if(emoji.hasSkinTone) {
        const skinToneModifier = String.fromCodePoint(0x1F3FB + skinTone - 1, 0xFE0F);
        let updatedCode = baseEmoji.replace(/\u{1F3FB}/u, skinToneModifier);
        return String.fromCodePoint(parseInt(updatedCode.replace("U+", ""), 16))
      }
      return String.fromCodePoint(parseInt(baseEmoji.replace("U+", ""), 16))
    } 
    else {
      const baseEmoji = emoji.code;
      if (emoji.hasSkinTone) {
          const skinTones = [
      '', // Skin tone 6 (Default)
      '\u{1F3FB}', // Skin tone 1 (Light)
      '\u{1F3FC}', // Skin tone 2 (Medium-Light)
      '\u{1F3FD}', // Skin tone 3 (Medium)
      '\u{1F3FE}', // Skin tone 4 (Medium-Dark)
      '\u{1F3FF}', // Skin tone 5 (Dark)
    ];
        const skinToneModifier = String.fromCodePoint(0X1f3fb + skinTone - 1);
        let updatedCode = baseEmoji.replace(/\u{1F3FB}/u, skinToneModifier);
       return String.fromCodePoint(parseInt(updatedCode.replace("U+", ""), 16)) + skinTones[skinTone]
      }
      return String.fromCodePoint(parseInt(baseEmoji.replace("U+", ""), 16));
    };
  }

  const emojiType = [
    "smiley",
    "animal",
    "travel",
    "activity",
    "object",
    "symbol",
  ];

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleStoreEmoji = (emoji) => {
    let storedEmoji = JSON.parse(localStorage.getItem("emjList")) || [];
    if (storedEmoji?.find((emj) => emj.code === emoji.code)) return;
    storedEmoji.unshift(emoji);
    localStorage.setItem("emjList", JSON.stringify(storedEmoji));
  };

  const emojiResult = searchText
    ? Object.values(emojiList)
        .flat()
        ?.filter(
          (item) =>
            item?.description
              ?.toLowerCase()
              .includes(searchText?.toLocaleLowerCase()) ||
            item?.keywords?.find((keyword) =>
              keyword
                ?.toLocaleLowerCase()
                ?.includes(searchText?.toLocaleLowerCase())
            )
        )
    : currentTab === -1
    ? JSON.parse(localStorage.getItem("emjList")) || []
    : emojiList[emojiType[currentTab]];

  return (
    <div className={`emoji-picker-selector-container ${theme}`} >
      <div className="emoji-search-skin">
        <input type="search" placeholder="search..." onChange={handleSearch} />
        <div
          className={`skin-tone-range-container ${
            showTone ? "open" : "close"
          } `}
        >
          {[...Array(6).keys()].reverse().map((item, i) => {
            return (
              <div
              key={i}
                onClick={() => {
                  setSkinTone(item);
                  setShowTone(!showTone);
                }}
                className={`skin skin${item} ${
                  skinTone === item  ? "active-skin" : ""
                } ${!showTone ? "hide-tone" : ""}`}
              ></div>
            );
          })}
        </div>
      </div>

      <div className="emoji-type-tab">
        <span
          onClick={() => {
            setCurrentTab(-1);
          }}
          className={`btn-history ${
            currentTab === -1 && !searchText ? "btn-active" : ""
          }`}
        ></span>
        {emojiType?.map((item, index) => {
          return (
            <span
            key={index}
              className={`btn-${item} ${
                index === currentTab && !searchText ? "btn-active" : ""
              }`}
              onClick={() => {
                setCurrentTab(index);
              }}
            ></span>
          );
        })}
      </div>

      <div className="emoji-picker-selector">
        {emojiResult?.map((emoji, index) => (
          <span
            key={index}
            onClick={() => {
              onEmojiClick(getEmojiWithSkinTone(emoji));
              handleStoreEmoji(emoji);
            }}
            className={`emoji`}
          >
            {getEmojiWithSkinTone(emoji)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;

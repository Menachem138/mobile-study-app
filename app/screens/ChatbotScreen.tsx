import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { useSupabase } from '../hooks/useSupabase';

const CHATBOT_USER = {
  _id: 'chatbot',
  name: 'עוזר הלמידה',
  avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
};

export function ChatbotScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { supabase } = useSupabase();

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'שלום! אני כאן לעזור לך בלמידה. אני יכול לתת טיפים ללמידה יעילה, לעזור בניהול זמן, ולענות על שאלות לגבי החומר שלך.',
        createdAt: new Date(),
        user: CHATBOT_USER,
      },
    ]);
  }, []);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages)
    );

    const userMessage = newMessages[0];
    await handleUserMessage(userMessage.text);
  }, []);

  const handleUserMessage = async (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('זמן') || lowerText.includes('time')) {
      const { data: timerData } = await supabase
        .from('timer_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      const { data: totalStudyTime } = await supabase
        .from('timer_history')
        .select('duration')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const weeklyTotal = totalStudyTime?.reduce((acc, curr) => acc + curr.duration, 0) || 0;
      const lastTimer = timerData?.[0];
      
      const response = lastTimer
        ? `בפעם האחרונה למדת ${lastTimer.duration} דקות. השבוע למדת סה"כ ${weeklyTotal} דקות. כל הכבוד! רוצה להתחיל טיימר חדש?`
        : 'עדיין לא השתמשת בטיימר. רוצה להתחיל?';

      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [{
          _id: Date.now(),
          text: response,
          createdAt: new Date(),
          user: CHATBOT_USER,
        }])
      );
    }
    else if (lowerText.includes('משימה') || lowerText.includes('task')) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('completed', false)
        .order('due_date', { ascending: true })
        .limit(3);

      const response = tasks?.length
        ? `יש לך ${tasks.length} משימות פתוחות:\n${tasks.map((task, i) => 
            `${i + 1}. ${task.title} (${new Date(task.due_date).toLocaleDateString('he-IL')})`
          ).join('\n')}`
        : 'אין לך משימות פתוחות כרגע. רוצה להוסיף משימה חדשה?';

      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [{
          _id: Date.now(),
          text: response,
          createdAt: new Date(),
          user: CHATBOT_USER,
        }])
      );
    }
    else if (lowerText.includes('קורס') || lowerText.includes('course')) {
      const { data: courses } = await supabase
        .from('courses')
        .select('*, chapters:course_chapters(*)');

      if (courses?.length) {
        const courseProgress = courses.map(course => {
          const totalChapters = course.chapters.length;
          const completedChapters = course.chapters.filter(ch => ch.completed).length;
          const percentage = Math.round((completedChapters / totalChapters) * 100);
          return `${course.title}: ${percentage}% הושלם`;
        }).join('\n');

        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, [{
            _id: Date.now(),
            text: `התקדמות בקורסים:\n${courseProgress}`,
            createdAt: new Date(),
            user: CHATBOT_USER,
          }])
        );
      }
    }
    else if (lowerText.includes('יומן') || lowerText.includes('journal')) {
      const { data: entries } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      const lastEntry = entries?.[0];
      const response = lastEntry
        ? `הרשומה האחרונה ביומן שלך: "${lastEntry.title}" (${new Date(lastEntry.created_at).toLocaleDateString('he-IL')})`
        : 'עדיין אין רשומות ביומן. רוצה להתחיל לכתוב?';

      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [{
          _id: Date.now(),
          text: response,
          createdAt: new Date(),
          user: CHATBOT_USER,
        }])
      );
    }
    else if (lowerText.includes('טיפ') || lowerText.includes('tip')) {
      const studyTips = [
        'השתמש בטכניקת פומודורו: 25 דקות למידה, 5 דקות הפסקה',
        'כתוב סיכומים בכתב יד - זה עוזר לזכור טוב יותר',
        'למד במקום שקט ונוח, רחוק מהסחות דעת',
        'עשה הפסקות קצרות כל שעה כדי לשמור על ריכוז',
        'הסבר את החומר לאחרים - זו דרך מצוינת להבין אותו טוב יותר',
        'צור מפת מושגים לנושא שאתה לומד',
        'תרגל שאלות מבחינות קודמות',
        'קבע יעדים קטנים וברי השגה',
        'השתמש בטכניקות זיכרון כמו סיפורים או ראשי תיבות',
        'חזור על החומר בפרקי זמן קבועים',
      ];

      const randomTip = studyTips[Math.floor(Math.random() * studyTips.length)];

      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [{
          _id: Date.now(),
          text: randomTip,
          createdAt: new Date(),
          user: CHATBOT_USER,
        }])
      );
    }
    else {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [{
          _id: Date.now(),
          text: 'אני יכול לעזור לך עם:\n- ניהול זמן ומעקב אחר למידה\n- משימות ומטלות\n- התקדמות בקורסים\n- יומן למידה\n- טיפים ללמידה יעילה\n\nמה תרצה לדעת?',
          createdAt: new Date(),
          user: CHATBOT_USER,
        }])
      );
    }
  };

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: 'user',
        }}
        placeholder="הקלד הודעה..."
        locale="he"
        renderAvatarOnTop
        alignTop
        isKeyboardInternallyHandled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

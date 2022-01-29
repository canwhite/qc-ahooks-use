import React ,{useState,useMemo,useRef}from 'react';
import './App.css';
import Mock from 'mockjs';
import {
    //请求类
    useRequest,

    //钩子类
    useMount,
    useUnmount,
    // seUnmountedRef, //通过current，判断组件是否已经被卸载
    
    //State
    useBoolean,
    // useDebounce,
    // useThrottle,

    //Scene
    useVirtualList,


    //Dom  
    // useInViewport, //dom到视图中提示
    // useScroll,//监听元素的滚动位置
    // useSize,  //监听dom节点尺寸变化的hook


    //监听和触发
    useUpdateEffect,
    useUpdate,


    //advanced
    useReactive



} from "ahooks"


//获取
function getUsername(): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve(Mock.mock('@name'));
      } else {
        reject(new Error('Failed to get username'));
      } 

    }, 1000);
  });
}

//更改
function changeUsername(username: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
}



//将单个组件拆开来使用
const BooleanUse  = () => {
  const [state, { toggle, setTrue, setFalse }] = useBoolean(true);

  return (
    <div>
      <p>Effects：{JSON.stringify(state)}</p>
      <p>
        <button type="button" onClick={toggle}>
          Toggle
        </button>
        <button type="button" onClick={setFalse} style={{ margin: '0 16px' }}>
          Set false
        </button>
        <button type="button" onClick={setTrue}>
          Set true
        </button>
      </p>
    </div>
  );
};


//请求后自动赋值
const RequestUseAuto = ()=>{
  
  const { data, error, loading } = useRequest(getUsername);

  if (error) {
    return <div>failed to load</div>;
  }
  if (loading) {
    return <div>loading...</div>;
  }
  return <div>Username: {data}</div>;

}


//手动触发
//useRequest、useUpdateEffect;
const RequstUseManual = ()=>{
  //需要我们手动触发
  const [state, setState] = useState('');
  

  //动态请求
  const { loading, run } = useRequest(changeUsername, {
    manual: true,
    debounceWait:3000,
    //run里边的参数会到这里
    onSuccess: (result:any, params) => {
      console.log("--params--",params);
      if (result.success) {
        setState('');
        // message.success(`The username was changed to "${params[0]}" !`);
        alert("success");
      }
    },
  });


  //用一个值去撬动另外一个值
  useUpdateEffect(()=>{
    //更新太过于频繁
    console.log("--state update--",state);

  },[state])
  

  return (
    <div>
      <input
        onChange={(e) => setState(e.target.value)}
        value={state}
        placeholder="Please enter username"
        style={{ width: 240, marginRight: 16 }}
      />
      <button disabled={loading} type="button" onClick={() => run(state)}>
        {loading ? 'Loading' : 'Edit'}
      </button>
    </div>
  );
}


//useUpdate - 强制更新
//组件名称要大写
const UpdateUse = ()=>{
  //uddate
  const update = useUpdate();
  
  return (
    <>
      <div>Time: {Date.now()}</div>
      <button type="button" onClick={update} style={{ marginTop: 8 }}>
        update
      </button>
    </>
  );

}


//Scene  useVirtualList
//首字母记得大写就可以了
//用于解决海量数据渲染时候，首屏渲染缓慢和滚动卡顿的问题
const VirtualListUse = ()=>{
  
  //使用useRef记得赋上初值 
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  //获取一个原始数据
  const originalList = useMemo(()=>Array.from(Array(9999).keys()),[])

  //首个参数，是数据源，后边是容器和UI控制
  const [list] = useVirtualList(originalList,{
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: 60, //item高度
    overscan: 10,  //视区上、下额外展示的 DOM 节点数量
  })

  
  return(
    <div> 
      {/* 最外层把高度给上，然后overflow给上 */}
      <div 
        ref={containerRef} 
        style={{ 
          height: '300px', 
          overflow: 'auto', 
          border: '1px solid' 
        }}>

        {/* 里边又加上了一层 */}
        <div ref={wrapperRef}>
          {list.map((ele) => (
            <div
              style={{
                height: 52,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid #e8e8e8',
                marginBottom: 8,
              }}
              key={ele.index}
            >
              Row: {ele.data}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


const ReactiveUse = ()=>{

  const state = useReactive({
    count: 0,
    inputVal: '',
    obj: {
      value: '',
    },
  });

  return (
    <div>
      <p> state.count：{state.count}</p>

      <button style={{ marginRight: 8 }} onClick={() => state.count++}>
        state.count++
      </button>
      <button onClick={() => state.count--}>state.count--</button>

      <p style={{ marginTop: 20 }}> state.inputVal: {state.inputVal}</p>
      <input onChange={(e) => (state.inputVal = e.target.value)} />

      <p style={{ marginTop: 20 }}> state.obj.value: {state.obj.value}</p>
      <input onChange={(e) => (state.obj.value = e.target.value)} />
    </div>
  );

}



function App() {

  //先说钩子吧，钩子比较重要
  useMount(()=>{
    console.log("init")
  })

  useUnmount(()=>{
    console.log("unMounted");
  })

  return (
    <div className="App">
      <p>--useBoolean--</p>
      <BooleanUse></BooleanUse>
      <p>--useRequst and useUpdateEffect--</p>
      <RequestUseAuto />
      <RequstUseManual />
      <p>--useUpdate--</p>
      <UpdateUse />


      <p>--useReactive--</p>
      <ReactiveUse />

      <p>--useVirtualList--</p>
      <VirtualListUse />


    </div>
  );
}

export default App;
